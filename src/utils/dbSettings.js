function createDbSettings(db) {
	function getSetting(key, cb) {
		db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
			if (err) return cb(err);
			cb(null, row ? row.value : null);
		});
	}

	function setSetting(key, value, cb) {
		db.run(
			"INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
			[key, String(value)],
			(err) => cb && cb(err)
		);
	}

	return { getSetting, setSetting };
}

module.exports = {
	createDbSettings,
};
