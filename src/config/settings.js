const db = require("./database");

// Global settings
const settings = {
  CONTACT_EMAIL: "you@example.com",
  CONTACT_DISCORD: "@YourDiscord",
  DEFAULT_PASSWORD: "changeme",
  ADMIN_PASSWORD_HASH: null,
  REQUIRE_ADMIN_SETUP: false
};

const TIMEKEEPING_POLICY_SUMMARY = `
By using this logger you agree that:
- Your entries may be treated as official work records.
- You are responsible for reviewing your own logs for accuracy.
- If you disagree with an edit or believe a log is inaccurate, you must dispute it in writing (email or Discord DM) as soon as reasonably possible.
- False or inflated hours are not allowed.
`;

function getSetting(key, cb) {
  db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
    if (err) return cb(err);
    cb(null, row ? row.value : null);
  });
}

function setSetting(key, value, cb) {
  db.run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value],
    cb || (() => {})
  );
}

function loadContactSettings() {
  db.get("SELECT value FROM settings WHERE key = 'contact_email'", (err, row) => {
    if (row && row.value != null) {
      settings.CONTACT_EMAIL = row.value;
    } else {
      db.run(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('contact_email', ?)",
        [settings.CONTACT_EMAIL]
      );
    }
  });

  db.get("SELECT value FROM settings WHERE key = 'contact_discord'", (err, row) => {
    if (row && row.value != null) {
      settings.CONTACT_DISCORD = row.value;
    } else {
      db.run(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('contact_discord', ?)",
        [settings.CONTACT_DISCORD]
      );
    }
  });
}

function updateContactSettings(email, discord) {
  settings.CONTACT_EMAIL = email;
  settings.CONTACT_DISCORD = discord;

  db.run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('contact_email', ?)",
    [settings.CONTACT_EMAIL]
  );
  db.run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('contact_discord', ?)",
    [settings.CONTACT_DISCORD]
  );
}

function loadDefaultPassword() {
  db.get(
    "SELECT value FROM settings WHERE key = 'default_password'",
    (err, row) => {
      if (row && row.value != null) {
        settings.DEFAULT_PASSWORD = row.value;
      } else {
        db.run(
          "INSERT OR IGNORE INTO settings (key, value) VALUES ('default_password', ?)",
          [settings.DEFAULT_PASSWORD]
        );
      }
    }
  );
}

function updateDefaultPassword(newVal) {
  settings.DEFAULT_PASSWORD = newVal;
  db.run(
    "UPDATE settings SET value = ? WHERE key = 'default_password'",
    [settings.DEFAULT_PASSWORD],
    function (err) {
      if (err) return;
      if (this.changes === 0) {
        db.run(
          "INSERT INTO settings (key, value) VALUES ('default_password', ?)",
          [settings.DEFAULT_PASSWORD]
        );
      }
    }
  );
}

function loadAdminPassword() {
  db.get(
    "SELECT value FROM settings WHERE key = 'admin_password_hash'",
    (err, row) => {
      if (row && row.value) {
        settings.ADMIN_PASSWORD_HASH = row.value;
        settings.REQUIRE_ADMIN_SETUP = false;
      } else {
        settings.ADMIN_PASSWORD_HASH = null;
        settings.REQUIRE_ADMIN_SETUP = true;
      }
    }
  );
}

function saveAdminPasswordHash(hash, cb) {
  settings.ADMIN_PASSWORD_HASH = hash;
  settings.REQUIRE_ADMIN_SETUP = false;
  db.run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password_hash', ?)",
    [hash],
    (err) => cb && cb(err)
  );
}

function loadSettings() {
    loadDefaultPassword();
    loadAdminPassword();
    loadContactSettings();
}

module.exports = {
  settings,
  TIMEKEEPING_POLICY_SUMMARY,
  getSetting,
  setSetting,
  loadSettings,
  loadContactSettings,
  updateContactSettings,
  loadDefaultPassword,
  updateDefaultPassword,
  loadAdminPassword,
  saveAdminPasswordHash
};
