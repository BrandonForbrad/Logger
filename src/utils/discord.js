const https = require("https");

/**
 * Send a Discord DM to a user via the Discord REST API.
 * @param {string} botToken - The Discord bot token
 * @param {string} discordUserId - The recipient's Discord user ID
 * @param {string} messageContent - The message text to send
 * @returns {Promise<boolean>} true if sent successfully
 */
function sendDiscordDM(botToken, discordUserId, messageContent) {
	return new Promise((resolve) => {
		if (!botToken || !discordUserId || !messageContent) {
			return resolve(false);
		}

		// Step 1: Open a DM channel with the user
		const dmPayload = JSON.stringify({ recipient_id: discordUserId });
		const dmReq = https.request(
			{
				hostname: "discord.com",
				path: "/api/v10/users/@me/channels",
				method: "POST",
				headers: {
					Authorization: `Bot ${botToken}`,
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(dmPayload),
				},
			},
			(dmRes) => {
				let data = "";
				dmRes.on("data", (chunk) => (data += chunk));
				dmRes.on("end", () => {
					try {
						const channel = JSON.parse(data);
						if (!channel.id) {
							console.error("Discord DM channel open failed:", data);
							return resolve(false);
						}

						// Step 2: Send a message to the DM channel
						const msgPayload = JSON.stringify({ content: messageContent });
						const msgReq = https.request(
							{
								hostname: "discord.com",
								path: `/api/v10/channels/${channel.id}/messages`,
								method: "POST",
								headers: {
									Authorization: `Bot ${botToken}`,
									"Content-Type": "application/json",
									"Content-Length": Buffer.byteLength(msgPayload),
								},
							},
							(msgRes) => {
								let msgData = "";
								msgRes.on("data", (chunk) => (msgData += chunk));
								msgRes.on("end", () => {
									resolve(msgRes.statusCode >= 200 && msgRes.statusCode < 300);
								});
							}
						);
						msgReq.on("error", () => resolve(false));
						msgReq.write(msgPayload);
						msgReq.end();
					} catch (e) {
						console.error("Discord DM parse error:", e);
						resolve(false);
					}
				});
			}
		);
		dmReq.on("error", () => resolve(false));
		dmReq.write(dmPayload);
		dmReq.end();
	});
}

/**
 * Test the Discord bot token by fetching the bot's own user info.
 * @param {string} botToken
 * @returns {Promise<{ok: boolean, username?: string, error?: string}>}
 */
function testDiscordBot(botToken) {
	return new Promise((resolve) => {
		if (!botToken) return resolve({ ok: false, error: "No token provided" });

		const req = https.request(
			{
				hostname: "discord.com",
				path: "/api/v10/users/@me",
				method: "GET",
				headers: {
					Authorization: `Bot ${botToken}`,
				},
			},
			(res) => {
				let data = "";
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => {
					try {
						const user = JSON.parse(data);
						if (user.id && user.username) {
							resolve({ ok: true, username: `${user.username}#${user.discriminator || "0"}` });
						} else {
							resolve({ ok: false, error: user.message || "Invalid token" });
						}
					} catch (e) {
						resolve({ ok: false, error: "Failed to parse response" });
					}
				});
			}
		);
		req.on("error", (e) => resolve({ ok: false, error: e.message }));
		req.end();
	});
}

/**
 * Exchange an OAuth2 authorization code for user info.
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} code
 * @param {string} redirectUri
 * @returns {Promise<{ok: boolean, id?: string, username?: string, discriminator?: string, error?: string}>}
 */
function exchangeDiscordCode(clientId, clientSecret, code, redirectUri) {
	return new Promise((resolve) => {
		const body = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: redirectUri,
			client_id: clientId,
			client_secret: clientSecret,
		}).toString();

		const tokenReq = https.request(
			{
				hostname: "discord.com",
				path: "/api/v10/oauth2/token",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Content-Length": Buffer.byteLength(body),
				},
			},
			(tokenRes) => {
				let data = "";
				tokenRes.on("data", (chunk) => (data += chunk));
				tokenRes.on("end", () => {
					try {
						const tokenData = JSON.parse(data);
						if (!tokenData.access_token) {
							return resolve({ ok: false, error: tokenData.error_description || tokenData.error || "Token exchange failed" });
						}

						// Fetch user info with the access token
						const userReq = https.request(
							{
								hostname: "discord.com",
								path: "/api/v10/users/@me",
								method: "GET",
								headers: {
									Authorization: `Bearer ${tokenData.access_token}`,
								},
							},
							(userRes) => {
								let userData = "";
								userRes.on("data", (chunk) => (userData += chunk));
								userRes.on("end", () => {
									try {
										const user = JSON.parse(userData);
										if (user.id) {
											resolve({
												ok: true,
												id: user.id,
												username: user.username,
												discriminator: user.discriminator || "0",
												global_name: user.global_name || user.username,
											});
										} else {
											resolve({ ok: false, error: "Failed to fetch Discord user" });
										}
									} catch (e) {
										resolve({ ok: false, error: "Failed to parse user data" });
									}
								});
							}
						);
						userReq.on("error", () => resolve({ ok: false, error: "User request failed" }));
						userReq.end();
					} catch (e) {
						resolve({ ok: false, error: "Failed to parse token response" });
					}
				});
			}
		);
		tokenReq.on("error", () => resolve({ ok: false, error: "Token request failed" }));
		tokenReq.write(body);
		tokenReq.end();
	});
}

module.exports = { sendDiscordDM, testDiscordBot, exchangeDiscordCode };
