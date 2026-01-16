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

  // Systems (like docs/boards for organizing tasks)
  db.run(`
    CREATE TABLE IF NOT EXISTS systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      content TEXT,
      color TEXT DEFAULT '#3b82f6',
      tags TEXT,
      position INTEGER DEFAULT 0,
      is_collapsed INTEGER DEFAULT 0,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  // Tasks within systems (checklist items with rich detail)
  db.run(`
    CREATE TABLE IF NOT EXISTS system_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      is_completed INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      assigned_to TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      tags TEXT,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT,
      completed_at TEXT,
      completed_by TEXT,
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
    )
  `);

  // Task checklist items (sub-tasks within a task)
  db.run(`
    CREATE TABLE IF NOT EXISTS task_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      completed_by TEXT,
      completed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES system_tasks(id) ON DELETE CASCADE
    )
  `);

  // Attachments for systems and tasks
  db.run(`
    CREATE TABLE IF NOT EXISTS system_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER,
      task_id INTEGER,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      uploaded_by TEXT,
      uploaded_at TEXT
    )
  `);

  // System edit history
  db.run(`
    CREATE TABLE IF NOT EXISTS system_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER NOT NULL,
      name TEXT,
      description TEXT,
      content TEXT,
      color TEXT,
      tags TEXT,
      changed_by TEXT,
      changed_at TEXT,
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
    )
  `);

  // Task edit history
  db.run(`
    CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      content TEXT,
      is_completed INTEGER,
      assigned_to TEXT,
      priority TEXT,
      due_date TEXT,
      tags TEXT,
      changed_by TEXT,
      changed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES system_tasks(id) ON DELETE CASCADE
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
  
  // Systems migrations
  db.run("ALTER TABLE systems ADD COLUMN content TEXT", () => {});
  db.run("ALTER TABLE systems ADD COLUMN tags TEXT", () => {});
  db.run("ALTER TABLE systems ADD COLUMN created_by TEXT", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN content TEXT", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN assigned_to TEXT", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN priority TEXT DEFAULT 'medium'", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN tags TEXT", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN created_by TEXT", () => {});
  db.run("ALTER TABLE system_tasks ADD COLUMN completed_by TEXT", () => {});
});

module.exports = db;
