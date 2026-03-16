const fs = require("fs");
const path = require("path");
const { exchangeDiscordCode } = require("../utils/discord");

module.exports = function registerProfileRoutes(app, deps) {
	const {
		db,
		bcrypt,
		upload,
		views,
		getCurrentUser,
		escapeHtml,
		uploadDir,
		getSetting,
	} = deps;

	// ---------- Profile page ----------
	app.get("/profile", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) {
			res.redirect("/login");
			return;
		}

		const msg = req.query.msg || "";
		const msgType = req.query.type || "ok";
		const message = msg ? { text: msg, type: msgType } : null;

		db.get(
			"SELECT profile_picture, discord_id, discord_username FROM users WHERE username = ?",
			[currentUser],
			(err, row) => {
				const profilePicture = row && row.profile_picture ? row.profile_picture : "";
				const discordId = row && row.discord_id ? row.discord_id : "";
				const discordUsername = row && row.discord_username ? row.discord_username : "";

				// Check if OAuth is configured
				getSetting("discord_client_id", (e1, clientId) => {
					const discordOAuthEnabled = !!clientId;

					res.send(
						views.profilePage({
							usernameEscaped: escapeHtml(currentUser),
							profilePicture,
							discordId,
							discordUsername,
							discordOAuthEnabled,
							message,
						})
					);
				});
			}
		);
	});

	// ---------- Upload profile picture ----------
	app.post("/profile/picture", upload.single("avatar"), (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) {
			res.redirect("/login");
			return;
		}

		if (!req.file) {
			res.redirect("/profile?msg=No+file+selected&type=error");
			return;
		}

		const mime = String(req.file.mimetype || "").toLowerCase();
		if (!mime.startsWith("image/")) {
			// Remove uploaded non-image file
			try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
			res.redirect("/profile?msg=Only+image+files+are+allowed&type=error");
			return;
		}

		// Check file size (5 MB max for avatars)
		const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
		if (req.file.size > MAX_AVATAR_BYTES) {
			try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
			res.redirect("/profile?msg=Image+must+be+under+5+MB&type=error");
			return;
		}

		const newPicturePath = "/uploads/" + req.file.filename;

		// Remove old profile picture file if it exists
		db.get(
			"SELECT profile_picture FROM users WHERE username = ?",
			[currentUser],
			(err, row) => {
				if (row && row.profile_picture) {
					const oldFilename = row.profile_picture.replace(/^\/uploads\//, "");
					if (oldFilename) {
						const oldPath = path.join(uploadDir, oldFilename);
						try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
					}
				}

				db.run(
					"UPDATE users SET profile_picture = ? WHERE username = ?",
					[newPicturePath, currentUser],
					(updateErr) => {
						if (updateErr) {
							res.redirect("/profile?msg=Failed+to+save+picture&type=error");
							return;
						}
						res.redirect("/profile?msg=Profile+picture+updated&type=ok");
					}
				);
			}
		);
	});

	// ---------- Remove profile picture ----------
	app.post("/profile/picture/remove", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) {
			res.redirect("/login");
			return;
		}

		db.get(
			"SELECT profile_picture FROM users WHERE username = ?",
			[currentUser],
			(err, row) => {
				if (row && row.profile_picture) {
					const oldFilename = row.profile_picture.replace(/^\/uploads\//, "");
					if (oldFilename) {
						const oldPath = path.join(uploadDir, oldFilename);
						try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
					}
				}

				db.run(
					"UPDATE users SET profile_picture = NULL WHERE username = ?",
					[currentUser],
					(updateErr) => {
						if (updateErr) {
							res.redirect("/profile?msg=Failed+to+remove+picture&type=error");
							return;
						}
						res.redirect("/profile?msg=Profile+picture+removed&type=ok");
					}
				);
			}
		);
	});

	// ---------- Change password ----------
	app.post("/profile/password", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) {
			res.redirect("/login");
			return;
		}

		const { current_password, new_password, confirm_password } = req.body;

		if (!current_password || !new_password || !confirm_password) {
			res.redirect("/profile?msg=All+fields+are+required&type=error");
			return;
		}

		if (new_password !== confirm_password) {
			res.redirect("/profile?msg=New+passwords+do+not+match&type=error");
			return;
		}

		const trimmed = new_password.trim();
		if (!trimmed) {
			res.redirect("/profile?msg=Password+cannot+be+empty&type=error");
			return;
		}

		db.get(
			"SELECT password_hash FROM users WHERE username = ?",
			[currentUser],
			(err, row) => {
				if (err || !row) {
					res.redirect("/profile?msg=User+not+found&type=error");
					return;
				}

				if (!row.password_hash) {
					// User never set a password hash (legacy) — skip comparison
					hashAndSave();
					return;
				}

				bcrypt.compare(current_password, row.password_hash, (cmpErr, same) => {
					if (cmpErr || !same) {
						res.redirect("/profile?msg=Current+password+is+incorrect&type=error");
						return;
					}
					hashAndSave();
				});

				function hashAndSave() {
					bcrypt.hash(trimmed, 10, (hashErr, hash) => {
						if (hashErr) {
							res.redirect("/profile?msg=Error+hashing+password&type=error");
							return;
						}

						db.run(
							"UPDATE users SET password_hash = ? WHERE username = ?",
							[hash, currentUser],
							(updateErr) => {
								if (updateErr) {
									res.redirect("/profile?msg=Failed+to+update+password&type=error");
									return;
								}
								res.redirect("/profile?msg=Password+updated+successfully&type=ok");
							}
						);
					});
				}
			}
		);
	});

	// ---------- Save Discord User ID ----------
	app.post("/profile/discord", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) {
			res.redirect("/login");
			return;
		}

		const discordId = (req.body.discord_id || "").trim();

		// Validate: must be empty (to clear) or a numeric string (Discord ID)
		if (discordId && !/^\d{17,20}$/.test(discordId)) {
			res.redirect("/profile?msg=Invalid+Discord+User+ID.+It+should+be+a+17-20+digit+number.&type=error");
			return;
		}

		db.run(
			"UPDATE users SET discord_id = ?, discord_username = NULL WHERE username = ?",
			[discordId || null, currentUser],
			(err) => {
				if (err) {
					res.redirect("/profile?msg=Failed+to+save+Discord+ID&type=error");
					return;
				}
				res.redirect("/profile?msg=Discord+ID+" + (discordId ? "saved" : "removed") + "+successfully&type=ok");
			}
		);
	});

	// ---------- Discord OAuth2 flow ----------
	app.get("/auth/discord", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser) return res.redirect("/login");

		getSetting("discord_client_id", (err, clientId) => {
			if (!clientId) {
				return res.redirect("/profile?msg=Discord+OAuth+not+configured.+Ask+an+admin+to+set+it+up.&type=error");
			}

			const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
			const host = req.headers['x-forwarded-host'] || req.headers.host;
			const redirectUri = encodeURIComponent(`${protocol}://${host}/auth/discord/callback`);
			const state = Buffer.from(JSON.stringify({ user: currentUser, ts: Date.now() })).toString('base64url');

			const url = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${redirectUri}&scope=identify&state=${state}`;
			res.redirect(url);
		});
	});

	app.get("/auth/discord/callback", (req, res) => {
		const { code, state } = req.query;

		if (!code || !state) {
			return res.redirect("/profile?msg=Discord+authorization+was+cancelled&type=error");
		}

		// Validate state
		let stateData;
		try {
			stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
		} catch (e) {
			return res.redirect("/profile?msg=Invalid+authorization+state&type=error");
		}

		// Verify this is the logged-in user and state isn't too old (10 min)
		const currentUser = getCurrentUser(req);
		if (!currentUser || currentUser !== stateData.user) {
			return res.redirect("/login");
		}
		if (Date.now() - stateData.ts > 10 * 60 * 1000) {
			return res.redirect("/profile?msg=Authorization+expired.+Please+try+again.&type=error");
		}

		getSetting("discord_client_id", (e1, clientId) => {
			getSetting("discord_client_secret", (e2, clientSecret) => {
				if (!clientId || !clientSecret) {
					return res.redirect("/profile?msg=Discord+OAuth+not+configured&type=error");
				}

				const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
				const host = req.headers['x-forwarded-host'] || req.headers.host;
				const redirectUri = `${protocol}://${host}/auth/discord/callback`;

				exchangeDiscordCode(clientId, clientSecret, code, redirectUri).then((result) => {
					if (!result.ok) {
						return res.redirect("/profile?msg=" + encodeURIComponent("Discord linking failed: " + result.error) + "&type=error");
					}

					const displayName = result.global_name || result.username;
					db.run(
						"UPDATE users SET discord_id = ?, discord_username = ? WHERE username = ?",
						[result.id, displayName, currentUser],
						(err) => {
							if (err) {
								return res.redirect("/profile?msg=Failed+to+save+Discord+link&type=error");
							}
							res.redirect("/profile?msg=Discord+account+linked+as+" + encodeURIComponent(displayName) + "&type=ok");
						}
					);
				});
			});
		});
	});
};
