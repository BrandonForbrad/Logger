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
      must_change_password INTEGER DEFAULT 0,
      profile_picture TEXT
    )
  `);

  // Add profile_picture column if it doesn't exist (migration for existing DBs)
  db.all("PRAGMA table_info(users)", (err, cols) => {
    if (err) return;
    const hasProfilePic = cols.some(c => c.name === "profile_picture");
    if (!hasProfilePic) {
      db.run("ALTER TABLE users ADD COLUMN profile_picture TEXT");
    }
    const hasDiscordId = cols.some(c => c.name === "discord_id");
    if (!hasDiscordId) {
      db.run("ALTER TABLE users ADD COLUMN discord_id TEXT");
    }
    const hasDiscordUsername = cols.some(c => c.name === "discord_username");
    if (!hasDiscordUsername) {
      db.run("ALTER TABLE users ADD COLUMN discord_username TEXT");
    }
  });

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

  // ── Timeline Roadmaps ──
  db.run(`
    CREATE TABLE IF NOT EXISTS roadmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#2563eb',
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roadmap_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roadmap_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'not-started',
      position INTEGER DEFAULT 0,
      color TEXT DEFAULT '#2563eb',
      task_id INTEGER,
      system_id INTEGER,
      google_docs_url TEXT,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT,
      completed_at TEXT,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES system_tasks(id) ON DELETE SET NULL,
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roadmap_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      uploaded_by TEXT,
      uploaded_at TEXT,
      FOREIGN KEY (milestone_id) REFERENCES roadmap_milestones(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS milestone_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_days REAL DEFAULT 1,
      status TEXT DEFAULT 'not-started',
      position INTEGER DEFAULT 0,
      task_id INTEGER,
      completed_at TEXT,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (milestone_id) REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES system_tasks(id) ON DELETE SET NULL
    )
  `);

  // Migration: add start_date / end_date to milestone_steps
  db.run("ALTER TABLE milestone_steps ADD COLUMN start_date TEXT", () => {});
  db.run("ALTER TABLE milestone_steps ADD COLUMN end_date TEXT", () => {});

  // Junction table for multiple tasks per step
  db.run(`
    CREATE TABLE IF NOT EXISTS step_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      created_at TEXT,
      FOREIGN KEY (step_id) REFERENCES milestone_steps(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES system_tasks(id) ON DELETE CASCADE,
      UNIQUE(step_id, task_id)
    )
  `);

  // ── Chat Messages (per-system and per-task) ──
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      context_type TEXT NOT NULL,
      context_id INTEGER NOT NULL,
      sender TEXT NOT NULL,
      body TEXT NOT NULL,
      parent_id INTEGER,
      reply_to_id INTEGER,
      edited INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      attachment_filename TEXT,
      attachment_original_name TEXT,
      attachment_mime_type TEXT,
      attachment_size INTEGER,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY (parent_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
      FOREIGN KEY (reply_to_id) REFERENCES chat_messages(id) ON DELETE SET NULL
    )
  `);

  // Add attachment columns to existing tables (safe to run multiple times)
  const attachmentCols = [
    "ALTER TABLE chat_messages ADD COLUMN attachment_filename TEXT",
    "ALTER TABLE chat_messages ADD COLUMN attachment_original_name TEXT",
    "ALTER TABLE chat_messages ADD COLUMN attachment_mime_type TEXT",
    "ALTER TABLE chat_messages ADD COLUMN attachment_size INTEGER"
  ];
  attachmentCols.forEach(sql => {
    db.run(sql, [], () => {}); // ignore errors if columns already exist
  });

  // ── Chat Notifications (@ mentions) ──
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      message_id INTEGER NOT NULL,
      context_type TEXT NOT NULL,
      context_id INTEGER NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    )
  `);

  // ── Discord Voice Sessions ──
  db.run(`
    CREATE TABLE IF NOT EXISTS discord_voice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      username TEXT,
      channel_id TEXT,
      channel_name TEXT,
      joined_at TEXT NOT NULL,
      left_at TEXT,
      duration_minutes REAL DEFAULT 0
    )
  `);

  // ── Discord Message Log ──
  db.run(`
    CREATE TABLE IF NOT EXISTS discord_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      username TEXT,
      discord_username TEXT,
      channel_id TEXT,
      channel_name TEXT,
      content TEXT,
      message_id TEXT,
      created_at TEXT NOT NULL
    )
  `);
  // Add guild_name columns for Discord server name tracking
  db.run("ALTER TABLE discord_voice_sessions ADD COLUMN guild_name TEXT", [], () => {});
  db.run("ALTER TABLE discord_messages ADD COLUMN guild_name TEXT", [], () => {});

  // ── API Keys (admin-managed, used for log dump ingestion) ──
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      label TEXT,
      created_by TEXT,
      created_at TEXT,
      last_used_at TEXT,
      is_active INTEGER DEFAULT 1
    )
  `);

  // ── Log Dump Categories ──
  db.run(`
    CREATE TABLE IF NOT EXISTS log_dump_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT
    )
  `);

  // ── Log Dumps ──
  db.run(`
    CREATE TABLE IF NOT EXISTS log_dumps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      log_content TEXT NOT NULL,
      api_key_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES log_dump_categories(id) ON DELETE CASCADE,
      FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
    )
  `);

  // ── Tooling (admin Node.js script runner) ──
  db.run(`
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      code TEXT DEFAULT '',
      secrets TEXT DEFAULT '{}',
      last_run_at TEXT,
      last_exit_code INTEGER,
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tool_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id INTEGER NOT NULL,
      status TEXT DEFAULT 'queued',
      output TEXT DEFAULT '',
      exit_code INTEGER,
      started_at TEXT,
      finished_at TEXT,
      run_by TEXT,
      FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
    )
  `);

  // Migration: add language column to tools
  db.run("ALTER TABLE tools ADD COLUMN language TEXT DEFAULT 'node'", () => {});

  // Migration: add run_command column to tools
  db.run("ALTER TABLE tools ADD COLUMN run_command TEXT DEFAULT ''", () => {});

  // Migration: add github_token column to tools
  db.run("ALTER TABLE tools ADD COLUMN github_token TEXT DEFAULT ''", () => {});

  // Migration: add webapp columns to tools
  db.run("ALTER TABLE tools ADD COLUMN webapp_enabled INTEGER DEFAULT 0", () => {});
  db.run("ALTER TABLE tools ADD COLUMN webapp_dir TEXT DEFAULT ''", () => {});

  // Migration: add webapp_public column to tools
  db.run("ALTER TABLE tools ADD COLUMN webapp_public INTEGER DEFAULT 0", () => {});
});

module.exports = db;
