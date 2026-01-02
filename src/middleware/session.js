const crypto = require("crypto");

function getCookies(req) {
	const header = req.headers.cookie || "";
	const pairs = header
		.split(";")
		.map((s) => s.trim())
		.filter(Boolean);
	const cookies = {};
	for (const p of pairs) {
		const [k, ...rest] = p.split("=");
		cookies[k] = decodeURIComponent(rest.join("="));
	}
	return cookies;
}

function createSessionTools(db) {
	function createSession(res, username, isAdminFlag) {
		const token = crypto.randomBytes(32).toString("hex");
		const now = Date.now();

		db.run(
			"INSERT INTO sessions (token, username, is_admin, created_at) VALUES (?, ?, ?, ?)",
			[token, username, isAdminFlag ? 1 : 0, now],
			() => {}
		);

		const maxAge = 7 * 24 * 60 * 60;
		res.setHeader(
			"Set-Cookie",
			`session=${token}; HttpOnly; Path=/; Max-Age=${maxAge}`
		);
	}

	function destroyCurrentSession(req, res) {
		const cookies = getCookies(req);
		const token = cookies.session;
		if (token) {
			db.run("DELETE FROM sessions WHERE token = ?", [token], () => {});
		}
		res.setHeader("Set-Cookie", "session=; HttpOnly; Path=/; Max-Age=0");
	}

	function sessionMiddleware(req, res, next) {
		const cookies = getCookies(req);
		const token = cookies.session;

		if (!token) {
			req.currentUser = null;
			req.isAdmin = false;
			return next();
		}

		db.get(
			"SELECT username, is_admin FROM sessions WHERE token = ?",
			[token],
			(err, row) => {
				if (err || !row) {
					res.setHeader(
						"Set-Cookie",
						"session=; HttpOnly; Path=/; Max-Age=0"
					);
					req.currentUser = null;
					req.isAdmin = false;
					return next();
				}
				req.currentUser = row.username || null;
				req.isAdmin = !!row.is_admin;
				next();
			}
		);
	}

	return {
		createSession,
		destroyCurrentSession,
		sessionMiddleware,
	};
}

module.exports = {
	createSessionTools,
};
