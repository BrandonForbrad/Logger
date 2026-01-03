const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "../../logs.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Database connected");
  }
});

db.serialize(() => {
	// Settings table must exist before any settings reads/writes.
	db.run(`
	  CREATE TABLE IF NOT EXISTS settings (
	    key TEXT PRIMARY KEY,
	    value TEXT
	  )
	`);

	// Ensure legal_hold flag exists (0 = off, 1 = on)
	db.run(
		"INSERT OR IGNORE INTO settings (key, value) VALUES ('legal_hold', '0')"
	);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_stopwatches (
      username TEXT PRIMARY KEY,
      elapsed_ms INTEGER DEFAULT 0,
      is_running INTEGER DEFAULT 0,
      last_started_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_personal_notes (
      username TEXT PRIMARY KEY,
      content TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pinned_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      created_at TEXT,
      username TEXT,
      is_pinned INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      hours REAL,
      content TEXT,
      image_url TEXT,
      media_path TEXT,
      media_type TEXT,
      media_upload_id INTEGER,
      username TEXT,
      deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      deleted_by TEXT,
      delete_reason TEXT
    )
  `);

  // Track async media uploads (used by uploader system).
  db.run(`
    CREATE TABLE IF NOT EXISTS media_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER,
      status TEXT,
      original_name TEXT,
      stored_name TEXT,
      mime_type TEXT,
      bytes_total INTEGER,
      bytes_loaded INTEGER,
      error TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS log_deletions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER,
      deleted_at TEXT,
      deleted_by TEXT,
      reason TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS log_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER,
      edited_at TEXT,
      editor_username TEXT,
      old_date TEXT,
      old_hours REAL,
      old_content TEXT,
      old_image_url TEXT,
      old_media_path TEXT,
      old_media_type TEXT,
      old_username TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      must_change_password INTEGER DEFAULT 0
    )
  `);

  // Best-effort migrations for older DBs (ignore errors)
  db.run("ALTER TABLE logs ADD COLUMN image_url TEXT", () => {});
  db.run("ALTER TABLE logs ADD COLUMN media_path TEXT", () => {});
  db.run("ALTER TABLE logs ADD COLUMN media_type TEXT", () => {});
  db.run("ALTER TABLE logs ADD COLUMN media_upload_id INTEGER", () => {});
  db.run("ALTER TABLE logs ADD COLUMN username TEXT", () => {});
  db.run(
    "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0",
    () => {}
  );
  db.run("ALTER TABLE logs ADD COLUMN deleted INTEGER DEFAULT 0", () => {});
  db.run("ALTER TABLE logs ADD COLUMN deleted_at TEXT", () => {});
  db.run("ALTER TABLE logs ADD COLUMN deleted_by TEXT", () => {});
  db.run("ALTER TABLE logs ADD COLUMN delete_reason TEXT", () => {});
});

module.exports = db;
