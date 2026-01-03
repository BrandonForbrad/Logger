module.exports = function registerAuthRoutes(app, deps) {
	const {
		db,
		bcrypt,
		upload,
		views,
		getDefaultPassword,
		getContactEmail,
		getContactDiscord,
		getCurrentUser,
		isAdmin,
		createSession,
		destroyCurrentSession,
		escapeHtml,
	} = deps;

	// ---------- User login/logout + first-login flow ----------
	app.get("/login", (req, res) => {
		const currentUser = getCurrentUser(req);
		if (currentUser) {
			res.redirect("/");
			return;
		}

		res.send(views.userLoginPage());
	});

	app.post("/login", (req, res) => {
		const { username, password } = req.body;
		if (!username || !password) {
			res.send("Username and password required.");
			return;
		}

		db.get(
			"SELECT id, username, password_hash, must_change_password FROM users WHERE username = ?",
			[username],
			(err, user) => {
				if (err || !user) {
					res.send(
						'Invalid username or password. <a href="/login">Try again</a>.'
					);
					return;
				}

				const typedPassword = password;
				const DEFAULT_PASSWORD = getDefaultPassword();

				// If user must change password (first login or forced change)
				if (user.must_change_password) {
					const sendFirstLoginPage = () => {
						res.send(
							views.firstLoginSetPasswordPage({
								usernameEscaped: escapeHtml(user.username),
							})
						);
					};

					// If user has no hash yet, they must use DEFAULT_PASSWORD for first login
					if (!user.password_hash) {
						if (typedPassword !== DEFAULT_PASSWORD) {
							res.send(
								'Invalid username or password. <a href="/login">Try again</a>.'
							);
							return;
						}
						// Correct default password => prompt for new password
						sendFirstLoginPage();
						return;
					} else {
						// Has a hash AND must change => check it, then force change
						bcrypt.compare(typedPassword, user.password_hash, (cmpErr, same) => {
							if (cmpErr || !same) {
								res.send(
									'Invalid username or password. <a href="/login">Try again</a>.'
								);
								return;
							}
							sendFirstLoginPage();
						});
						return;
					}
				}

				// Normal login path (no forced change)
				if (!user.password_hash) {
					// Safety: in case old users existed without hash and must_change_password=0
					if (typedPassword !== DEFAULT_PASSWORD) {
						res.send(
							'Invalid username or password. <a href="/login">Try again</a>.'
						);
						return;
					}

					createSession(res, user.username, false);
					res.redirect("/");
					return;
				} else {
					bcrypt.compare(typedPassword, user.password_hash, (cmpErr, same) => {
						if (cmpErr || !same) {
							res.send(
								'Invalid username or password. <a href="/login">Try again</a>.'
							);
							return;
						}

						createSession(res, user.username, false);
						res.redirect("/");
					});
					return;
				}
			}
		);
	});

	// Handle first-login password set (invalidate any old sessions just in case)
	app.post("/first-login", (req, res) => {
		const { username, password, confirm } = req.body;
		if (!username || !password || !confirm) {
			res.send("All fields are required.");
			return;
		}
		if (password !== confirm) {
			res.send('Passwords do not match. <a href="/login">Back to login</a>.');
			return;
		}

		const trimmed = password.trim();
		if (!trimmed) {
			res.send('Password cannot be empty. <a href="/login">Back to login</a>.');
			return;
		}

		bcrypt.hash(trimmed, 10, (err, hash) => {
			if (err) {
				res.status(500).send("Error hashing password");
				return;
			}

			db.run(
				"UPDATE users SET password_hash = ?, must_change_password = 0 WHERE username = ?",
				[hash, username],
				function (dbErr) {
					if (dbErr || this.changes === 0) {
						res.send("User not found or error updating password.");
						return;
					}

					// Kill any previous sessions for that user, then log in
					db.run("DELETE FROM sessions WHERE username = ?", [username], () => {
						createSession(res, username, false);
						res.redirect("/");
					});
				}
			);
		});
	});

	app.get("/logout", (req, res) => {
		destroyCurrentSession(req, res);
		res.redirect("/login");
	});

	// ---------- Inline paste upload (for editor paste) ----------
	app.post("/upload-inline", upload.single("file"), (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}
		if (!req.file) {
			return res.status(400).json({ error: "No file" });
		}
		const mediaPath = "/uploads/" + req.file.filename;
		res.json({ url: mediaPath });
	});

	// ---------- New Log Form (with upload, requires logged-in user) ----------
	app.get("/new", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		const userNameForLog = currentUser || (admin ? "admin" : null);
		if (!userNameForLog) {
			res.redirect("/login");
			return;
		}

		const today = new Date().toISOString().split("T")[0];

		res.send(
			views.newLogPage({
				today,
				currentUserEscaped: escapeHtml(currentUser || "admin"),
				CONTACT_EMAIL: getContactEmail(),
				CONTACT_DISCORD: getContactDiscord(),
				ASYNC_UPLOAD_THRESHOLD_BYTES:
					Number(process.env.ASYNC_UPLOAD_THRESHOLD_BYTES) || 50 * 1024 * 1024,
			})
		);
	});
};
