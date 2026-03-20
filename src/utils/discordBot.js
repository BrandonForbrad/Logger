const { Client, GatewayIntentBits, Events } = require("discord.js");

let client = null;
let db = null;
let guildId = null;
let pollInterval = null;

// In-memory map of active voice sessions: discordUserId -> { channelId, channelName, joinedAt, guildName }
const activeSessions = new Map();

function resolveUsername(discordId, cb) {
	if (!db) return cb(null);
	db.get(
		"SELECT username FROM users WHERE discord_id = ?",
		[discordId],
		(err, row) => cb(row ? row.username : null)
	);
}

// Poll guild voice channels — called every 10 seconds
function pollVoiceChannels() {
	if (!client || !client.isReady() || !guildId || !db) return;

	const guild = client.guilds.cache.get(guildId);
	if (!guild) return;

	const gName = guild.name || "";

	// Build set of users currently in voice
	const currentVoiceUsers = new Map(); // discordId -> { channelId, channelName }
	guild.voiceStates.cache.forEach((vs) => {
		if (vs.member && vs.member.user && vs.member.user.bot) return;
		if (vs.channel) {
			currentVoiceUsers.set(vs.id, {
				channelId: vs.channel.id,
				channelName: vs.channel.name,
			});
		}
	});

	// Close sessions for users who left
	activeSessions.forEach((session, userId) => {
		const current = currentVoiceUsers.get(userId);
		// User left entirely, or switched channels
		if (!current || current.channelId !== session.channelId) {
			const leftAt = new Date().toISOString();
			const joinedMs = new Date(session.joinedAt).getTime();
			const durationMin = Math.round(((Date.now() - joinedMs) / 60000) * 100) / 100;
			console.log(`[DiscordBot] Voice LEAVE: ${userId} left #${session.channelName} (${durationMin} min)`);

			resolveUsername(userId, (username) => {
				db.run(
					`UPDATE discord_voice_sessions
					 SET left_at = ?, duration_minutes = ?, username = COALESCE(?, username)
					 WHERE discord_id = ? AND left_at IS NULL AND channel_id = ?`,
					[leftAt, durationMin, username, userId, session.channelId],
					(err) => { if (err) console.error("[DiscordBot] DB update error (leave):", err.message); }
				);
			});
			activeSessions.delete(userId);
		}
	});

	// Open sessions for new users (or users who switched channels)
	currentVoiceUsers.forEach((info, userId) => {
		if (!activeSessions.has(userId)) {
			const now = new Date().toISOString();
			console.log(`[DiscordBot] Voice JOIN: ${userId} in #${info.channelName}`);
			activeSessions.set(userId, {
				channelId: info.channelId,
				channelName: info.channelName,
				joinedAt: now,
				guildName: gName,
			});
			resolveUsername(userId, (username) => {
				db.run(
					`INSERT INTO discord_voice_sessions (discord_id, username, channel_id, channel_name, joined_at, guild_name)
					 VALUES (?, ?, ?, ?, ?, ?)`,
					[userId, username, info.channelId, info.channelName, now, gName],
					(err) => { if (err) console.error("[DiscordBot] DB insert error (join):", err.message); }
				);
			});
		}
	});

	// Update duration for everyone still connected
	activeSessions.forEach((session, userId) => {
		const joinedMs = new Date(session.joinedAt).getTime();
		const durationMin = Math.round(((Date.now() - joinedMs) / 60000) * 100) / 100;
		db.run(
			`UPDATE discord_voice_sessions
			 SET duration_minutes = ?
			 WHERE discord_id = ? AND left_at IS NULL AND channel_id = ?`,
			[durationMin, userId, session.channelId]
		);
	});
}

function startBot(database, token, guild) {
	if (client) {
		client.destroy();
		client = null;
	}
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}

	if (!token) return;

	db = database;
	guildId = guild || null;

	client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	client.once(Events.ClientReady, (c) => {
		console.log(`[DiscordBot] Logged in as ${c.user.tag}`);

		// Close any stale unclosed sessions from previous runs
		const now = new Date().toISOString();
		db.run(
			`UPDATE discord_voice_sessions SET left_at = ?, duration_minutes = COALESCE(duration_minutes, 0) WHERE left_at IS NULL`,
			[now],
			(err) => {
				if (err) console.error("[DiscordBot] Error closing stale sessions:", err.message);
				else console.log("[DiscordBot] Closed stale sessions from previous runs.");
				activeSessions.clear();

				// Run first poll immediately to pick up users already in voice
				pollVoiceChannels();

				// Then poll every 10 seconds
				pollInterval = setInterval(pollVoiceChannels, 10000);
				console.log("[DiscordBot] Voice polling started (every 10s).");
			}
		);
	});

	// Message tracking
	client.on(Events.MessageCreate, (message) => {
		if (message.author.bot) return;
		if (guildId && message.guild && message.guild.id !== guildId) return;
		if (!message.guild) return; // Ignore DMs

		const discordId = message.author.id;
		const discordUsername = message.author.globalName || message.author.username;
		const channelId = message.channel.id;
		const channelName = message.channel.name || "unknown";
		const gName = message.guild ? message.guild.name : "";
		const content = (message.content || "").substring(0, 2000);
		const createdAt = message.createdAt.toISOString();

		resolveUsername(discordId, (username) => {
			db.run(
				`INSERT INTO discord_messages (discord_id, username, discord_username, channel_id, channel_name, content, message_id, created_at, guild_name)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[discordId, username, discordUsername, channelId, channelName, content, message.id, createdAt, gName]
			);
		});
	});

	client.login(token).catch((err) => {
		if (err.message && err.message.includes("disallowed intents")) {
			console.error("[DiscordBot] Login failed: Privileged intents not enabled. Go to Discord Developer Portal → Bot → Privileged Gateway Intents and enable: Message Content Intent, Server Members Intent, Presence Intent.");
		} else {
			console.error("[DiscordBot] Login failed:", err.message);
		}
		client = null;
	});
}

function stopBot() {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
	// Close out any active voice sessions
	if (db) {
		const now = new Date().toISOString();
		activeSessions.forEach((session, userId) => {
			const joinedMs = new Date(session.joinedAt).getTime();
			const durationMin = Math.round(((Date.now() - joinedMs) / 60000) * 100) / 100;
			db.run(
				`UPDATE discord_voice_sessions
				 SET left_at = ?, duration_minutes = ?
				 WHERE discord_id = ? AND left_at IS NULL`,
				[now, durationMin, userId]
			);
		});
		activeSessions.clear();
	}

	if (client) {
		client.destroy();
		client = null;
	}
}

function isRunning() {
	return client !== null && client.isReady();
}

module.exports = { startBot, stopBot, isRunning };
