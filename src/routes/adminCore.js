function registerAdminCoreRoutes(app, deps) {
	const {
		db,
		bcrypt,
		views,
		escapeHtml,
		getSetting,
		setSetting,
		isAdmin,
		createSession,
		destroyCurrentSession,
		updateDefaultPassword,
		updateContactSettings,
		getRequireAdminSetup,
		getAdminPasswordHash,
		getDefaultPassword,
		getContactEmail,
		getContactDiscord,
		saveAdminPasswordHash,
	} = deps;

	app.get("/admin/panel", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		res.send(views.adminPanelPage());
	});

	// ---------- Admin setup (first time) ----------
	app.get("/admin/setup", (req, res) => {
		if (!getRequireAdminSetup()) {
			res.redirect("/admin");
			return;
		}

		res.send(views.adminSetupPage());
	});

	app.post("/admin/setup", (req, res) => {
		if (!getRequireAdminSetup()) {
			res.redirect("/admin");
			return;
		}
		const { password, confirm } = req.body;
		if (!password || !confirm) {
			return res.send("Both fields are required.");
		}
		if (password !== confirm) {
			return res.send(
				'Passwords do not match. <a href="/admin/setup">Try again</a>.'
			);
		}
		const trimmed = password.trim();
		if (!trimmed) {
			return res.send(
				'Password cannot be empty. <a href="/admin/setup">Try again</a>.'
			);
		}

		bcrypt.hash(trimmed, 10, (err, hash) => {
			if (err) {
				return res.status(500).send("Error hashing password");
			}
			saveAdminPasswordHash(hash, (dbErr) => {
				if (dbErr) {
					return res.status(500).send("Error saving admin password");
				}
				res.redirect("/admin");
			});
		});
	});

	// ---------- Admin login ----------
	app.get("/admin", (req, res) => {
		if (getRequireAdminSetup()) {
			res.redirect("/admin/setup");
			return;
		}

		if (isAdmin(req)) {
			res.redirect("/");
			return;
		}

		res.send(views.adminLoginPage());
	});

	app.post("/admin/login", (req, res) => {
		const { password } = req.body;
		const ADMIN_PASSWORD_HASH = getAdminPasswordHash();
		if (getRequireAdminSetup() || !ADMIN_PASSWORD_HASH) {
			res.redirect("/admin/setup");
			return;
		}

		bcrypt.compare(password, ADMIN_PASSWORD_HASH, (err, same) => {
			if (err || !same) {
				res.send('Invalid password. <a href="/admin">Try again</a>.');
				return;
			}
			createSession(res, "admin", true);
			res.redirect("/");
		});
	});

	app.get("/admin/logout", (req, res) => {
		destroyCurrentSession(req, res);
		res.redirect("/login");
	});

	// ---------- Admin: change admin password ----------
	app.get("/admin/password", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		res.send(views.adminChangePasswordPage());
	});

	app.post("/admin/password", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");
		const { current, password, confirm } = req.body;
		if (!current || !password || !confirm) {
			return res.send("All fields are required.");
		}
		if (password !== confirm) {
			return res.send(
				'Passwords do not match. <a href="/admin/password">Try again</a>.'
			);
		}
		const trimmed = password.trim();
		if (!trimmed) {
			return res.send(
				'Password cannot be empty. <a href="/admin/password">Try again</a>.'
			);
		}
		const ADMIN_PASSWORD_HASH = getAdminPasswordHash();
		if (!ADMIN_PASSWORD_HASH) {
			return res.send(
				'Admin password not set. <a href="/admin/setup">Set it first</a>.'
			);
		}

		bcrypt.compare(current, ADMIN_PASSWORD_HASH, (err, same) => {
			if (err || !same) {
				return res.send(
					'Current password incorrect. <a href="/admin/password">Try again</a>.'
				);
			}

			bcrypt.hash(trimmed, 10, (hashErr, hash) => {
				if (hashErr) {
					return res.status(500).send("Error hashing new password");
				}
				saveAdminPasswordHash(hash, (dbErr) => {
					if (dbErr) {
						return res.status(500).send("Error saving new admin password");
					}

					// Invalidate ALL admin sessions and this one
					db.run("DELETE FROM sessions WHERE is_admin = 1", () => {
						destroyCurrentSession(req, res);
						res.send(
							'Admin password updated. Please <a href="/admin">log in again</a>.'
						);
					});
				});
			});
		});
	});

	// ---------- Admin: manage users (create / reset / delete / default password) ----------
	app.get("/admin/users", (req, res) => {
		if (!isAdmin(req)) {
			res.status(403).send("Forbidden");
			return;
		}

		const DEFAULT_PASSWORD = getDefaultPassword();
		const CONTACT_EMAIL = getContactEmail();
		const CONTACT_DISCORD = getContactDiscord();

		db.all(
			"SELECT id, username FROM users ORDER BY username ASC",
			(err, users) => {
				if (err) {
					res.status(500).send("DB error");
					return;
				}

				const usersHtml = users
					.map(
						(u) => `
					<tr>
						<td>@${escapeHtml(u.username)}</td>
						<td>
							<form method="POST" action="/admin/users/reset/${u.id}" style="display:flex; gap:4px; align-items:center;">
								<input type="password" name="password" placeholder="New password" required />
								<button type="submit">Reset</button>
							</form>
						</td>
						<td>
							<form method="POST" action="/admin/users/delete/${u.id}" onsubmit="return confirm('Delete this user? Logs will keep their username but account is removed.');">
								<button type="submit" class="danger">Delete</button>
							</form>
						</td>
					</tr>
				`
					)
					.join("");

				res.send(
					views.manageUsersPage({
						usersHtml,
						DEFAULT_PASSWORD: escapeHtml(DEFAULT_PASSWORD),
						CONTACT_EMAIL: escapeHtml(CONTACT_EMAIL),
						CONTACT_DISCORD: escapeHtml(CONTACT_DISCORD),
					})
				);
			}
		);
	});

	// ---------- Admin: Legal Hold toggle ----------
	app.get("/admin/legal-hold", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		getSetting("legal_hold", (err, val) => {
			if (err) {
				console.error("Error loading legal_hold:", err);
				return res.status(500).send("Error loading legal hold setting.");
			}

			const isOn = val === "1";
			res.send(views.legalHoldPage({ isOn }));
		});
	});

	app.post("/admin/legal-hold", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		const on = !!req.body.on;
		setSetting("legal_hold", on ? "1" : "0", (err) => {
			if (err) {
				console.error("Error saving legal_hold:", err);
				return res.status(500).send("Error saving legal hold setting.");
			}
			res.redirect("/admin/legal-hold");
		});
	});

	// Update DefaultPassword setting
	app.post("/admin/settings/default-password", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");
		const def = (req.body.default_password || "").trim();
		if (!def) {
			return res.send(
				'Default password cannot be empty. <a href="/admin/users">Back</a>'
			);
		}
		updateDefaultPassword(def);
		res.redirect("/admin/users");
	});

	app.post("/admin/users", (req, res) => {
		if (!isAdmin(req)) {
			res.status(403).send("Forbidden");
			return;
		}

		const { username, password } = req.body;
		if (!username) {
			res.send("Username required.");
			return;
		}

		const trimmedPass = (password || "").trim();

		if (!trimmedPass) {
			// No password supplied => use DefaultPassword, require first-change
			db.run(
				"INSERT INTO users (username, password_hash, must_change_password) VALUES (?, NULL, 1)",
				[username],
				(dbErr) => {
					if (dbErr) {
						res.send(
							"Error creating user (maybe username already exists)."
						);
					} else {
						res.redirect("/admin/users");
					}
				}
			);
		} else {
			// Provided password => set normally, no forced change
			bcrypt.hash(trimmedPass, 10, (err, hash) => {
				if (err) {
					res.status(500).send("Error hashing password");
					return;
				}

				db.run(
					"INSERT INTO users (username, password_hash, must_change_password) VALUES (?, ?, 0)",
					[username, hash],
					(dbErr) => {
						if (dbErr) {
							res.send(
								"Error creating user (maybe username already exists)."
							);
						} else {
							res.redirect("/admin/users");
						}
					}
				);
			});
		}
	});

	// Update contact email / discord
	app.post("/admin/settings/contact", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		let email = (req.body.contact_email || "").trim();
		let discord = (req.body.contact_discord || "").trim();

		if (!email && !discord) {
			return res.send(
				'At least one contact method (email or Discord) is required. <a href="/admin/users">Back</a>'
			);
		}

		if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return res.send('Invalid email format. <a href="/admin/users">Back</a>');
		}

		updateContactSettings(email || getContactEmail(), discord || getContactDiscord());
		res.redirect("/admin/users");
	});

	// Reset password for a specific user (invalidate sessions)
	app.post("/admin/users/reset/:id", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		const id = req.params.id;
		const { password } = req.body;
		const trimmed = (password || "").trim();
		if (!trimmed) {
			res.send("Password required.");
			return;
		}

		bcrypt.hash(trimmed, 10, (err, hash) => {
			if (err) {
				res.status(500).send("Error hashing password");
				return;
			}

			db.get("SELECT username FROM users WHERE id = ?", [id], (selErr, row) => {
				if (selErr || !row) {
					return res.send("User not found.");
				}
				const username = row.username;

				db.run(
					"UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?",
					[hash, id],
					(updErr) => {
						if (updErr) {
							return res.status(500).send("Error updating password.");
						}
						db.run("DELETE FROM sessions WHERE username = ?", [username], () =>
							res.redirect("/admin/users")
						);
					}
				);
			});
		});
	});

	// Delete a user (invalidate sessions)
	app.post("/admin/users/delete/:id", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");
		const id = req.params.id;

		db.get("SELECT username FROM users WHERE id = ?", [id], (selErr, row) => {
			const username = row && row.username;
			if (username) {
				db.run("DELETE FROM sessions WHERE username = ?", [username], () => {
					db.run("DELETE FROM users WHERE id = ?", [id], () =>
						res.redirect("/admin/users")
					);
				});
			} else {
				db.run("DELETE FROM users WHERE id = ?", [id], () =>
					res.redirect("/admin/users")
				);
			}
		});
	});
}

module.exports = registerAdminCoreRoutes;
