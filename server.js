const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const marked = require("marked");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const os = require("os");
const { spawn, exec } = require("child_process");
const crypto = require("crypto");

const app = express();
const DB_PATH = path.join(__dirname, "logs.db");
console.log("Server started");



const db = new sqlite3.Database(DB_PATH);
db.get("SELECT value FROM settings WHERE key = 'admin_password_set'", (err, row) => {
  if (err) {
    // table didn't exist yet → create it now
    db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)", () => {
      db.run("INSERT OR IGNORE INTO settings (key,value) VALUES ('admin_password_set','0')");
    });
  }
});
console.log("Database connected");

// ---------- DB setup ----------
db.run(`
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  hours REAL,
  content TEXT,
  image_url TEXT,
  media_path TEXT,
  media_type TEXT,
  username TEXT
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

db.run(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
)
`);

// NEW: sessions table for server-side auth
db.run(`
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  username TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER
)
`);

const uploadDir = path.join(__dirname, "uploads");
const backupsDir = path.join(__dirname, "backups");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// Default user password (loaded from DB settings)
let DEFAULT_PASSWORD = "changeme";

// Admin password is stored hashed in settings
let ADMIN_PASSWORD_HASH = null;
let REQUIRE_ADMIN_SETUP = false;

// ---------- Helpers ----------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

// These now rely on session middleware (see below)
function isAdmin(req) {
  return !!req.isAdmin;
}

function getCurrentUser(req) {
  return req.currentUser || null;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return value.toFixed(2) + " " + sizes[i];
}

function getDirectorySize(dirPath) {
  let total = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    const stat = fs.statSync(full);
    if (entry.isDirectory()) {
      total += getDirectorySize(full);
    } else {
      total += stat.size;
    }
  }
  return total;
}

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d);
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function getDiskUsage(callback) {
  const root = path.parse(__dirname).root; // "D:\" or "/"
  if (process.platform === "win32") {
    const drive = root.replace(/\\$/, ""); // "D:"
    const cmd = `wmic logicaldisk where "DeviceID='${drive}'" get Size,FreeSpace /format:value`;
    exec(cmd, (err, stdout) => {
      if (err || !stdout) {
        return callback(null, null);
      }
      const sizeMatch = stdout.match(/Size=(\d+)/);
      const freeMatch = stdout.match(/FreeSpace=(\d+)/);
      if (!sizeMatch || !freeMatch) {
        return callback(null, null);
      }
      const totalBytes = parseInt(sizeMatch[1], 10);
      const freeBytes = parseInt(freeMatch[1], 10);
      callback(null, { totalBytes, freeBytes });
    });
  } else {
    exec(`df -k "${__dirname}"`, (err, stdout) => {
      if (err || !stdout) {
        return callback(null, null);
      }
      const lines = stdout.trim().split(/\r?\n/);
      if (lines.length < 2) return callback(null, null);
      const parts = lines[1].trim().split(/\s+/);
      const totalK = parseInt(parts[1], 10);
      const availK = parseInt(parts[3], 10);
      if (isNaN(totalK) || isNaN(availK)) {
        return callback(null, null);
      }
      callback(null, {
        totalBytes: totalK * 1024,
        freeBytes: availK * 1024,
      });
    });
  }
}

function restartSelf() {
  const nodePath = process.argv[0];
  const scriptPath = process.argv[1];

  try {
    const child = spawn(nodePath, [scriptPath], {
      detached: true,
      stdio: "inherit",
    });
    child.unref();
  } catch (e) {
    console.error("Failed to spawn new process:", e);
  }

  process.exit(0);
}

// ---------- Upload setup (for logs + inline images + backup upload) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));
app.use(bodyParser.urlencoded({ extended: true }));


// If table existed from older versions, try to add missing columns (ignore errors)
db.run("ALTER TABLE logs ADD COLUMN image_url TEXT", () => {});
db.run("ALTER TABLE logs ADD COLUMN media_path TEXT", () => {});
db.run("ALTER TABLE logs ADD COLUMN media_type TEXT", () => {});
db.run("ALTER TABLE logs ADD COLUMN username TEXT", () => {});
db.run("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0", () => {});

// Load / update default password from settings
function loadDefaultPassword() {
  db.get(
    "SELECT value FROM settings WHERE key = 'default_password'",
    (err, row) => {
      if (row && row.value != null) {
        DEFAULT_PASSWORD = row.value;
      } else {
        db.run(
          "INSERT OR IGNORE INTO settings (key, value) VALUES ('default_password', ?)",
          [DEFAULT_PASSWORD]
        );
      }
    }
  );
}

function updateDefaultPassword(newVal) {
  DEFAULT_PASSWORD = newVal;
  db.run(
    "UPDATE settings SET value = ? WHERE key = 'default_password'",
    [DEFAULT_PASSWORD],
    function (err) {
      if (err) return;
      if (this.changes === 0) {
        db.run(
          "INSERT INTO settings (key, value) VALUES ('default_password', ?)",
          [DEFAULT_PASSWORD]
        );
      }
    }
  );
}

// Load admin password hash from settings
function loadAdminPassword() {
  db.get(
    "SELECT value FROM settings WHERE key = 'admin_password_hash'",
    (err, row) => {
      if (row && row.value) {
        ADMIN_PASSWORD_HASH = row.value;
        REQUIRE_ADMIN_SETUP = false;
      } else {
        ADMIN_PASSWORD_HASH = null;
        REQUIRE_ADMIN_SETUP = true;
      }
    }
  );
}

function saveAdminPasswordHash(hash, cb) {
  ADMIN_PASSWORD_HASH = hash;
  REQUIRE_ADMIN_SETUP = false;
  db.run(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password_hash', ?)",
    [hash],
    (err) => cb && cb(err)
  );
}

loadDefaultPassword();
loadAdminPassword();

// ---------- Session-based auth helpers + middleware ----------
function createSession(res, username, isAdminFlag) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  db.run(
    "INSERT INTO sessions (token, username, is_admin, created_at) VALUES (?, ?, ?, ?)",
    [token, username, isAdminFlag ? 1 : 0, now],
    () => {}
  );

  const maxAge = 7 * 24 * 60 * 60; // 7 days
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
  // Clear cookie
  res.setHeader("Set-Cookie", "session=; HttpOnly; Path=/; Max-Age=0");
}

app.use((req, res, next) => {
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
        // invalid / stale session → clear cookie and treat as logged out
        res.setHeader("Set-Cookie", "session=; HttpOnly; Path=/; Max-Age=0");
        req.currentUser = null;
        req.isAdmin = false;
        return next();
      }
      req.currentUser = row.username || null;
      req.isAdmin = !!row.is_admin;
      next();
    }
  );
});

// ---------- Backup helpers ----------
function createBackup(callback) {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
  const filename = `backup-${timestamp}.zip`;
  const backupPath = path.join(backupsDir, filename);

  const output = fs.createWriteStream(backupPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    callback(null, {
      filename,
      path: backupPath,
      size: archive.pointer(),
    });
  });

  archive.on("error", (err) => {
    callback(err);
  });

  archive.pipe(output);

  if (fs.existsSync(DB_PATH)) {
    archive.file(DB_PATH, { name: "logs.db" });
  }
  if (fs.existsSync(uploadDir)) {
    archive.directory(uploadDir, "uploads");
  }

  archive.finalize();
}

function restoreFromBackup(backupFilePath, callback) {
  try {
    if (!fs.existsSync(backupFilePath)) {
      return callback(new Error("Backup file does not exist."));
    }

    const tmpDir = path.join(__dirname, "restore-tmp-" + Date.now());
    fs.mkdirSync(tmpDir);

    const zip = new AdmZip(backupFilePath);
    zip.extractAllTo(tmpDir, true);

    const restoredDbPath = path.join(tmpDir, "logs.db");
    const restoredUploadsPath = path.join(tmpDir, "uploads");

    if (!fs.existsSync(restoredDbPath)) {
      return callback(new Error("Backup is missing logs.db"));
    }

    db.close((closeErr) => {
      if (closeErr) {
        console.error("Error closing DB before restore:", closeErr);
      }

      try {
        if (fs.existsSync(DB_PATH)) {
          const backupName = DB_PATH + ".bak-" + Date.now();
          fs.renameSync(DB_PATH, backupName);
        }

        fs.copyFileSync(restoredDbPath, DB_PATH);

        if (fs.existsSync(restoredUploadsPath)) {
          if (fs.existsSync(uploadDir)) {
            fs.rmSync(uploadDir, { recursive: true, force: true });
          }
          fs.mkdirSync(uploadDir, { recursive: true });
          copyRecursive(restoredUploadsPath, uploadDir);
        }

        // Clean temp dir
        fs.rmSync(tmpDir, { recursive: true, force: true });

        callback(null);
      } catch (e) {
        callback(e);
      }
    });
  } catch (e) {
    callback(e);
  }
}

// ---------- Homepage – list logs, grouped by date, filter by username ----------
app.get("/", (req, res) => {
  // Force initial admin setup before anything else
  if (REQUIRE_ADMIN_SETUP) {
    res.redirect("/admin/setup");
    return;
  }

  const userFilter = req.query.user || "";
  const currentUser = getCurrentUser(req);
  const admin = isAdmin(req);

  // Require login (user or admin) to see anything
  if (!currentUser && !admin) {
    res.redirect("/login");
    return;
  }

  db.all("SELECT * FROM logs ORDER BY date DESC, id DESC", (err, rows) => {
    if (err) {
      res.status(500).send("DB error");
      return;
    }

    // Per-user total hours (overall)
    const perUserTotals = {};
    rows.forEach((r) => {
      if (!r.username) return;
      const h = Number(r.hours) || 0;
      perUserTotals[r.username] = (perUserTotals[r.username] || 0) + h;
    });

    // Collect list of usernames for filter dropdown
    const usernames = Array.from(
      new Set(rows.map((r) => r.username).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    // Apply filter if selected
    let filteredRows = rows;
    if (userFilter) {
      filteredRows = rows.filter((r) => r.username === userFilter);
    }

    // Group logs by date
    const grouped = {};
    filteredRows.forEach((log) => {
      const key = log.date || "No Date";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const contentHtml = dates
      .map((date) => {
        const logs = grouped[date];

        const totalHours = logs.reduce(
          (sum, log) => sum + (Number(log.hours) || 0),
          0
        );
        const countEntries = logs.length;

        const logsHtml = logs
          .map((log) => {
            let mediaHtml = "";

            if (log.media_path) {
              const safePath = escapeHtml(log.media_path);
              if (log.media_type === "video") {
                mediaHtml = `
                  <div class="media">
                    <video controls class="media-element">
                      <source src="${safePath}">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                `;
              } else {
                mediaHtml = `
                  <div class="media">
                    <img src="${safePath}" class="media-element" alt="Log media">
                  </div>
                `;
              }
            } else if (log.image_url) {
              mediaHtml = `
                <div class="media">
                  <img src="${escapeHtml(
                    log.image_url
                  )}" class="media-element" alt="Log image">
                </div>
              `;
            }

            const adminActions = admin
              ? `
              <div class="admin-actions">
                <a href="/edit/${log.id}" class="pill-button pill-button-ghost">Edit</a>
                <form method="POST" action="/delete/${log.id}" style="display:inline;" onsubmit="return confirm('Delete this log?');">
                  <button type="submit" class="pill-button pill-button-danger">Delete</button>
                </form>
              </div>
            `
              : "";

            const usernameLabel = log.username
              ? `<span class="username-badge">@${escapeHtml(log.username)}</span>`
              : `<span class="username-badge username-anon">[no user]</span>`;

            return `
              <article class="log-card">
                <header class="log-header">
                  <div>
                    ${usernameLabel}
                    <div class="hours-row">
                      <span class="hours-label">Hours</span>
                      <span class="hours-value">${log.hours}</span>
                    </div>
                  </div>
                  <div class="log-id">#${log.id}</div>
                </header>
                <div class="log-body">
                  ${marked.parse(log.content || "")}
                  ${mediaHtml}
                </div>
                ${adminActions}
              </article>
            `;
          })
          .join("");

        return `
          <section class="day-section">
            <div class="day-header">
              <h2 class="day-title">${escapeHtml(date)}</h2>
              <div class="day-meta">
                <span>${countEntries} entr${countEntries === 1 ? "y" : "ies"}</span>
                <span>${totalHours.toFixed(2)} total hours</span>
              </div>
            </div>
            ${logsHtml}
          </section>
        `;
      })
      .join("");

    const filterFormHtml = `
      <form method="GET" action="/" class="filter-bar">
        <label for="userFilter" class="filter-label">Filter by user (with totals):</label>
        <select id="userFilter" name="user" class="filter-select" onchange="this.form.submit()">
          <option value="">All users</option>
          ${usernames
            .map((u) => {
              const safe = escapeHtml(u);
              const selected = u === userFilter ? " selected" : "";
              const total = perUserTotals[u] || 0;
              return `<option value="${safe}"${selected}>${safe} (${total.toFixed(
                2
              )}h)</option>`;
            })
            .join("")}
        </select>
        ${
          userFilter
            ? `<a href="/" class="filter-clear">Clear</a>`
            : ""
        }
      </form>
    `;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Logs</title>
      <style>
        :root {
          --bg: #f3f4f6;
          --surface: #ffffff;
          --surface-alt: #f9fafb;
          --border: #e5e7eb;
          --border-strong: #d1d5db;
          --accent: #00a2ff;
          --accent-soft: #e0f2ff;
          --text-main: #111827;
          --text-muted: #6b7280;
          --danger: #e11d48;
          --shadow-soft: 0 10px 25px rgba(15, 23, 42, 0.08);
          --radius-lg: 16px;
          --radius-pill: 999px;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: radial-gradient(circle at top left, #e5f2ff 0, #f3f4f6 55%, #eef2ff 100%);
          color: var(--text-main);
        }
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }

        .page-shell {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 24px 12px;
        }
        .page-inner {
          width: 100%;
          max-width: 1100px;
        }

        header.site-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: linear-gradient(135deg, #00a2ff, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 8px 18px rgba(59, 130, 246, 0.45);
        }
        .brand-title {
          font-weight: 700;
          font-size: 20px;
        }
        .brand-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .pill-button {
          border-radius: var(--radius-pill);
          border: 1px solid transparent;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: var(--accent);
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 3px 8px rgba(0, 162, 255, 0.4);
        }
        .pill-button-ghost {
          background: transparent;
          color: var(--text-main);
          border-color: var(--border-strong);
          box-shadow: none;
        }
        .pill-button-danger {
          background: var(--danger);
          border-color: var(--danger);
          color: white;
          box-shadow: 0 3px 8px rgba(190, 18, 60, 0.4);
        }
        .pill-button:hover { filter: brightness(1.05); text-decoration: none; }

        .top-links {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          justify-content: flex-end;
        }

        .content-shell {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(240px, 1fr);
          gap: 18px;
          align-items: flex-start;
        }

        .main-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(209, 213, 219, 0.7);
          box-shadow: var(--shadow-soft);
          padding: 18px 20px 24px;
          backdrop-filter: blur(12px);
        }

        .sidebar-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 18px;
          border: 1px solid rgba(209, 213, 219, 0.8);
          padding: 16px 16px 18px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
        .sidebar-heading {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .sidebar-item {
          font-size: 13px;
          padding: 6px 0;
          display: flex;
          justify-content: space-between;
          color: var(--text-muted);
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 999px;
          background: var(--surface-alt);
          border: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .filter-label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .filter-select {
          border-radius: 999px;
          border: 1px solid var(--border);
          padding: 5px 10px;
          font-size: 13px;
          background: white;
        }
        .filter-clear {
          font-size: 11px;
          color: var(--text-muted);
        }

        .day-section {
          margin-bottom: 18px;
        }
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .day-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          padding-bottom: 4px;
          border-bottom: 2px solid var(--border-strong);
        }
        .day-meta {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          gap: 12px;
        }

        .log-card {
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-alt);
          padding: 10px 12px;
          margin-bottom: 10px;
        }
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .hours-row {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          margin-top: 4px;
        }
        .hours-label {
          color: var(--text-muted);
        }
        .hours-value {
          font-weight: 600;
          color: #16a34a;
        }
        .log-id {
          font-size: 11px;
          color: var(--text-muted);
        }
        .log-body {
          font-size: 13px;
          line-height: 1.5;
        }
        .log-body h1, .log-body h2, .log-body h3 {
          margin-top: 10px;
          margin-bottom: 6px;
        }
        .log-body p {
          margin: 4px 0;
        }
        .log-body ul {
          margin: 4px 0 4px 20px;
        }
        .media-element {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-top: 8px;
        }

        .admin-actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }

        .username-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: #0369a1;
          font-size: 11px;
          font-weight: 500;
        }
        .username-anon {
          background: #f3f4f6;
          color: var(--text-muted);
        }

        @media (max-width: 840px) {
          .content-shell {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <div class="page-shell">
        <div class="page-inner">
          <header class="site-header">
            <div class="brand">
              <div class="brand-logo">DL</div>
              <div>
                <div class="brand-title">Daily Logger</div>
                <div class="brand-subtitle">Internal dev-style worklog</div>
              </div>
            </div>
            <div class="top-links">
              ${
                currentUser
                  ? `<span>User: @${escapeHtml(
                      currentUser
                    )}</span> <a href="/logout" class="pill-button pill-button-ghost">User Logout</a>`
                  : `<a href="/login" class="pill-button pill-button-ghost">User Login</a>`
              }
              ${
                admin
                  ? `<span>Admin</span>
                     <a href="/admin/logout" class="pill-button pill-button-ghost">Logout</a>
                     <a href="/admin/users" class="pill-button pill-button-ghost">Users</a>
                     <a href="/admin/missed" class="pill-button pill-button-ghost">Missed Hours</a>
                     <a href="/admin/backups" class="pill-button pill-button-ghost">Backups</a>
                     <a href="/admin/password" class="pill-button pill-button-ghost">Admin Password</a>`
                  : `<a href="/admin" class="pill-button pill-button-ghost">Admin</a>`
              }
              <a href="/new" class="pill-button">➕ New Log</a>
            </div>
          </header>

          <div class="content-shell">
            <main class="main-card">
              ${filterFormHtml}
              ${contentHtml}
            </main>

            <aside class="sidebar-card">
              <div class="sidebar-heading">Tips</div>
              <div class="sidebar-item">
                <span>Markdown formatting</span>
              </div>
              <div class="sidebar-item">
                <span>Paste images directly</span>
              </div>
              <div class="sidebar-item">
                <span>Use headings &amp; lists</span>
              </div>
              <div class="sidebar-heading" style="margin-top:10px;">Users &amp; Hours</div>
              ${
                usernames.length
                  ? usernames
                      .map((u) => {
                        const total = perUserTotals[u] || 0;
                        return `<div class="sidebar-item"><span>@${escapeHtml(
                          u
                        )}</span><span>${total.toFixed(1)}h</span></div>`;
                      })
                      .join("")
                  : '<div class="sidebar-item"><span>No users yet</span></div>'
              }
            </aside>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    res.send(html);
  });
});

// ---------- Admin setup (first time) ----------
app.get("/admin/setup", (req, res) => {
  if (!REQUIRE_ADMIN_SETUP) {
    res.redirect("/admin");
    return;
  }

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Initial Admin Setup</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
      .card {
        background:white;
        padding:24px 28px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:420px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 16px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; }
      input {
        padding:8px 10px;
        width:100%;
        margin:6px 0 14px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        width:100%;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <h1>Initial Admin Password</h1>
        <p class="sub">This is your first time running Daily Logger. Set a secure admin password to continue.</p>
        <form method="POST" action="/admin/setup">
          <label>Admin password</label>
          <input type="password" name="password" required />
          <label>Confirm password</label>
          <input type="password" name="confirm" required />
          <button type="submit">Save Admin Password</button>
        </form>
      </div>
    </div>
  </body>
  </html>
  `);
});

app.post("/admin/setup", (req, res) => {
  if (!REQUIRE_ADMIN_SETUP) {
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
  if (REQUIRE_ADMIN_SETUP) {
    res.redirect("/admin/setup");
    return;
  }

  if (isAdmin(req)) {
    res.redirect("/");
    return;
  }

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Login</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; }
      .card {
        background:white;
        padding:24px 28px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:380px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 16px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; }
      input {
        padding:8px 10px;
        width:100%;
        margin:6px 0 14px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        width:100%;
      }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <h1>Admin Login</h1>
        <p class="sub">Sign in with your admin password.</p>
        <form method="POST" action="/admin/login">
          <label>Password</label>
          <input type="password" name="password" required />
          <button type="submit">Sign in as Admin</button>
        </form>
        <p style="margin-top:10px;"><a href="/">⬅ Back</a></p>
      </div>
    </div>
  </body>
  </html>
  `);
});

app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (REQUIRE_ADMIN_SETUP || !ADMIN_PASSWORD_HASH) {
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

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Change Admin Password</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
      .card {
        background:white;
        padding:24px 28px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:420px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 16px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; }
      input {
        padding:8px 10px;
        width:100%;
        margin:6px 0 14px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        width:100%;
      }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <h1>Change Admin Password</h1>
        <p class="sub">Update the password used for admin login.</p>
        <form method="POST" action="/admin/password">
          <label>Current password</label>
          <input type="password" name="current" required />
          <label>New password</label>
          <input type="password" name="password" required />
          <label>Confirm new password</label>
          <input type="password" name="confirm" required />
          <button type="submit">Update Password</button>
        </form>
        <p style="margin-top:10px;"><a href="/">⬅ Back</a></p>
      </div>
    </div>
  </body>
  </html>
  `);
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

      res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Manage Users</title>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:16px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:720px;
        }
        h1 { margin:0 0 10px; font-size:20px; }
        h2 { margin:16px 0 6px; font-size:15px; }
        p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
        label { font-size:13px; font-weight:500; }
        input {
          padding:6px 8px;
          border-radius:10px;
          border:1px solid #d1d5db;
          font-family:inherit;
          font-size:13px;
        }
        button {
          padding:6px 10px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-size:13px;
          cursor:pointer;
          white-space:nowrap;
        }
        button.danger {
          background:#e11d48;
        }
        table {
          width:100%;
          border-collapse:collapse;
          margin-top:8px;
          font-size:13px;
        }
        th, td {
          padding:6px 4px;
          border-bottom:1px solid #e5e7eb;
          text-align:left;
        }
        th { font-weight:600; color:#4b5563; }
        a { font-size:12px; color:#6b7280; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .top-link { margin-bottom:10px; font-size:12px; }
        .inline-links { font-size:12px; margin-bottom:8px; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div class="top-link"><a href="/">⬅ Back to logs</a></div>
          <h1>Manage Users</h1>
          <p class="sub">Create accounts, reset passwords, delete users, and control the default first-login password.</p>

          <div class="inline-links">
            <a href="/admin/password">Change Admin Password</a> ·
            <a href="/admin/backups">Backups &amp; Restore</a> ·
            <a href="/admin/missed">Missed Hours</a>
          </div>

          <h2>DefaultPassword</h2>
          <p class="sub">Users created with an empty password will log in using this default password once, then be forced to set their own.</p>
          <form method="POST" action="/admin/settings/default-password" style="margin-bottom:14px;">
            <label>DefaultPassword</label><br>
            <input type="text" name="default_password" value="${escapeHtml(
              DEFAULT_PASSWORD
            )}" />
            <button type="submit" style="margin-left:6px;">Save Default</button>
          </form>

          <h2>Create New User</h2>
          <form method="POST" action="/admin/users">
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <div style="flex:1; min-width:140px;">
                <label>Username</label><br>
                <input type="text" name="username" required />
              </div>
              <div style="flex:1; min-width:140px;">
                <label>Password</label><br>
                <input type="password" name="password" placeholder="Leave blank to use DefaultPassword on first login" />
              </div>
              <div>
                <button type="submit">Create User</button>
              </div>
            </div>
          </form>

          <h2>Existing Users</h2>
          <p class="sub">You can't view existing passwords (they're securely hashed), but you can reset them or delete users.</p>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Reset Password</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              ${usersHtml || '<tr><td colspan="3">No users yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
    `);
    }
  );
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
          res.send("Error creating user (maybe username already exists).");
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
            res.send("Error creating user (maybe username already exists).");
          } else {
            res.redirect("/admin/users");
          }
        }
      );
    });
  }
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
          // kill any active sessions for that user
          db.run(
            "DELETE FROM sessions WHERE username = ?",
            [username],
            () => res.redirect("/admin/users")
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
      db.run(
        "DELETE FROM sessions WHERE username = ?",
        [username],
        () => {
          db.run("DELETE FROM users WHERE id = ?", [id], () =>
            res.redirect("/admin/users")
          );
        }
      );
    } else {
      db.run("DELETE FROM users WHERE id = ?", [id], () =>
        res.redirect("/admin/users")
      );
    }
  });
});

// ---------- User login/logout + first-login flow ----------
app.get("/login", (req, res) => {
  const currentUser = getCurrentUser(req);
  if (currentUser) {
    res.redirect("/");
    return;
  }

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>User Login</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
      .card {
        background:white;
        padding:24px 28px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:380px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 16px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; }
      input {
        padding:8px 10px;
        width:100%;
        margin:6px 0 14px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        width:100%;
      }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <h1>User Login</h1>
        <p class="sub">If your account was created without a password, use the shared DefaultPassword for your first login.</p>
        <form method="POST" action="/login">
          <label>Username</label>
          <input type="text" name="username" required />
          <label>Password</label>
          <input type="password" name="password" required />
          <button type="submit">Sign in</button>
        </form>
        <p style="margin-top:10px;"><a href="/admin">Admin login</a></p>
      </div>
    </div>
  </body>
  </html>
  `);
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
        res.send('Invalid username or password. <a href="/login">Try again</a>.');
        return;
      }

      const typedPassword = password;

      // If user must change password (first login or forced change)
      if (user.must_change_password) {
        const sendFirstLoginPage = () => {
          res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Set Your Password</title>
            <style>
              body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
              .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
              .card {
                background:white;
                padding:24px 28px;
                border-radius:16px;
                border:1px solid #e5e7eb;
                box-shadow:0 10px 25px rgba(15,23,42,0.08);
                width:100%;
                max-width:380px;
              }
              h1 { margin:0 0 8px; font-size:20px; }
              p.sub { margin:0 0 16px; font-size:13px; color:#6b7280; }
              label { font-size:13px; font-weight:500; }
              input {
                padding:8px 10px;
                width:100%;
                margin:6px 0 14px;
                border-radius:10px;
                border:1px solid #d1d5db;
                font-family:inherit;
              }
              button {
                padding:8px 14px;
                border-radius:999px;
                border:none;
                background:#00a2ff;
                color:white;
                font-weight:500;
                cursor:pointer;
                width:100%;
              }
              a { font-size:12px; color:#6b7280; text-decoration:none; }
              a:hover { text-decoration:underline; }
            </style>
          </head>
          <body>
            <div class="shell">
              <div class="card">
                <h1>Set Your Password</h1>
                <p class="sub">This looks like your first login. Choose a new password to continue.</p>
                <form method="POST" action="/first-login">
                  <input type="hidden" name="username" value="${escapeHtml(
                    user.username
                  )}" />
                  <label>New password</label>
                  <input type="password" name="password" required />
                  <label>Confirm password</label>
                  <input type="password" name="confirm" required />
                  <button type="submit">Save Password</button>
                </form>
                <p style="margin-top:10px;"><a href="/login">Cancel</a></p>
              </div>
            </div>
          </body>
          </html>
          `);
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
    res.send(
      'Passwords do not match. <a href="/login">Back to login</a>.'
    );
    return;
  }

  const trimmed = password.trim();
  if (!trimmed) {
    res.send(
      'Password cannot be empty. <a href="/login">Back to login</a>.'
    );
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
        db.run(
          "DELETE FROM sessions WHERE username = ?",
          [username],
          () => {
            createSession(res, username, false);
            res.redirect("/");
          }
        );
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
  if (!currentUser && !admin) {
    res.redirect("/login");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Clock In</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card {
        background:white;
        padding:22px 24px;
        border-radius:18px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:900px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; }
      input {
        padding:7px 9px;
        font-family:inherit;
        font-size:13px;
        border-radius:10px;
        border:1px solid #d1d5db;
        width:100%;
      }
      textarea {
        width:100%;
        min-height:260px;
        padding:8px 10px;
        font-family:inherit;
        font-size:13px;
        border-radius:10px;
        border:1px solid #d1d5db;
        resize:vertical;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
      }
      .secondary {
        background:#e5e7eb;
        color:#111827;
      }
      .field { margin-bottom:12px; }
      .label-row {
        display:flex;
        justify-content:space-between;
        align-items:center;
      }
      .hint { font-size:11px; color:#6b7280; }
      .toolbar { margin-bottom: 8px; display:flex; flex-wrap:wrap; gap:4px; }
      .toolbar button {
        background:#f3f4f6;
        color:#111827;
        border-radius:8px;
        border:1px solid #d1d5db;
        padding:4px 8px;
        font-size:11px;
      }
      .layout {
        display:flex;
        gap:16px;
        align-items:flex-start;
      }
      .half { flex:1; min-width:0; }
      #preview {
        border:1px solid #e5e7eb;
        padding:10px;
        border-radius:10px;
        min-height:260px;
        background:#fafafa;
        font-size:13px;
      }
      h3 { margin:0 0 6px; font-size:14px; }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
      @media (max-width:800px) {
        .layout { flex-direction:column; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <h1>New Daily Log</h1>
            <p class="sub">Describe what you worked on, with Markdown and inline images.</p>
          </div>
          <div style="font-size:12px; color:#6b7280; text-align:right;">
            <div>Logged in as <strong>@${escapeHtml(
              currentUser || "admin"
            )}</strong></div>
            <div><a href="/">⬅ Back to logs</a></div>
          </div>
        </div>

        <form method="POST" action="/new" enctype="multipart/form-data">
          <div class="field">
            <div class="label-row">
              <label>Date</label>
            </div>
            <input type="date" name="date" value="${today}" required />
          </div>

          <div class="field">
            <div class="label-row">
              <label>Hours Worked</label>
            </div>
            <input type="number" step="0.1" name="hours" required />
          </div>

          <div class="field">
            <div class="label-row">
              <label>Image URL (optional, for remote images)</label>
            </div>
            <input type="url" name="image_url" placeholder="https://example.com/image.png" />
          </div>

          <div class="field">
            <div class="label-row">
              <label>Upload Image/Video (optional)</label>
              <span class="hint">Stored locally under /uploads</span>
            </div>
            <input type="file" name="media" accept="image/*,video/*" />
          </div>

          <div class="field">
            <div class="label-row">
              <label>Log (Markdown, with paste-images)</label>
              <span class="hint">Paste images directly; use "Resize Img" to adjust width.</span>
            </div>

            <div class="toolbar">
              <button type="button" onclick="applyWrap('**','**')"><b>B</b></button>
              <button type="button" onclick="applyWrap('*','*')"><i>I</i></button>
              <button type="button" onclick="applyPrefix('## ')">H2</button>
              <button type="button" onclick="applyPrefix('- ')">• List</button>
              <button type="button" onclick="applyWrap('\`','\`')">Code</button>
              <button type="button" onclick="insertLink()">Link</button>
              <button type="button" onclick="insertImage()">Image URL</button>
              <button type="button" onclick="resizeImage()">Resize Img</button>
            </div>

            <div class="layout">
              <div class="half">
                <h3>Editor</h3>
                <textarea id="content" name="content" placeholder="Write your log here..."></textarea>
              </div>
              <div class="half">
                <h3>Live Preview</h3>
                <div id="preview"></div>
              </div>
            </div>
          </div>

          <div style="margin-top:14px; display:flex; gap:10px; align-items:center;">
            <button type="submit">Save Log</button>
            <a href="/" class="secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>

    <script>
      const textarea = document.getElementById("content");
      const preview = document.getElementById("preview");

      function updatePreview() {
        const text = textarea.value || "Start typing to see a preview...";
        preview.innerHTML = marked.parse(text);
      }

      textarea.addEventListener("input", updatePreview);
      updatePreview();

      // Paste image support
      textarea.addEventListener("paste", async (event) => {
        const items = event.clipboardData?.items || [];
        for (const item of items) {
          if (item.type && item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            try {
              const res = await fetch("/upload-inline", {
                method: "POST",
                body: formData
              });
              const data = await res.json();
              if (!data.url) return;
              const before = textarea.value.slice(0, textarea.selectionStart);
              const after = textarea.value.slice(textarea.selectionEnd);
              const insertion = "\\n<img src=\\"" + data.url + "\\" style=\\"max-width:100%; width:400px;\\" />\\n";
              const nextPos = before.length + insertion.length;
              textarea.value = before + insertion + after;
              textarea.selectionStart = textarea.selectionEnd = nextPos;
              updatePreview();
            } catch (e) {
              alert("Failed to upload pasted image.");
            }
            return;
          }
        }
      });

      function applyWrap(before, after) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const selected = value.slice(start, end) || "text";
        const replacement = before + selected + after;

        textarea.setRangeText(replacement, start, end, "end");
        textarea.focus();
        updatePreview();
      }

      function applyPrefix(prefix) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        const before = value.slice(0, start);
        const selected = value.slice(start, end) || "text";
        const after = value.slice(end);

        const lines = selected.split("\\n").map(line => prefix + line);
        const replacement = lines.join("\\n");

        textarea.value = before + replacement + after;
        const cursorPos = before.length + replacement.length;
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
        textarea.focus();
        updatePreview();
      }

      function insertLink() {
        const url = prompt("Enter URL:", "https://");
        if (!url) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const selected = value.slice(start, end) || "link text";

        const replacement = "[" + selected + "](" + url + ")";

        textarea.setRangeText(replacement, start, end, "end");
        textarea.focus();
        updatePreview();
      }

      function insertImage() {
        const url = prompt("Enter image URL:", "https://");
        if (!url) return;

        const alt = prompt("Alt text (optional):", "") || "image";

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const replacement = "![" + alt + "](" + url + ")";

        textarea.setRangeText(replacement, start, end, "end");
        textarea.focus();
        updatePreview();
      }

      function resizeImage() {
        const width = prompt("Image width in px (e.g. 400):", "400");
        if (!width) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        let selected = value.slice(start, end);

        if (!selected) {
          alert("Select an <img> tag or image URL to resize.");
          return;
        }

        // If user selected a raw URL or markdown, wrap it into an <img>
        if (!selected.includes("<img")) {
          const url = selected.trim();
          selected = '<img src="' + url + '" style="max-width:100%; width:' + width + 'px;" />';
        } else {
          // Try to replace existing width style
          if (selected.includes("style=")) {
            selected = selected.replace(/width:\\s*[^;"]+/i, 'width:' + width + 'px');
          } else {
            selected = selected.replace(
              "<img",
              '<img style="max-width:100%; width:' + width + 'px;"'
            );
          }
        }

        textarea.setRangeText(selected, start, end, "end");
        textarea.focus();
        updatePreview();
      }
    </script>
  </body>
  </html>
  `);
});

// ---------- Edit form (admin only, with upload & paste) ----------
app.get("/edit/:id", (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).send("Forbidden");
    return;
  }

  const id = req.params.id;
  db.get("SELECT * FROM logs WHERE id = ?", [id], (err, log) => {
    if (!log) {
      res.status(404).send("Not found");
      return;
    }

    const safeContent = escapeHtml(log.content || "");
    const safeImageUrl = escapeHtml(log.image_url || "");
    const safeDate = escapeHtml(log.date || "");
    const safeUsername = escapeHtml(log.username || "");

    let currentMediaHtml = "";
    if (log.media_path) {
      const safePath = escapeHtml(log.media_path);
      if (log.media_type === "video") {
        currentMediaHtml = `
          <div style="margin-top:8px;">
            <strong>Current uploaded media:</strong><br>
            <video controls style="max-width:300px;height:auto;">
              <source src="${safePath}">
            </video>
          </div>
        `;
      } else {
        currentMediaHtml = `
          <div style="margin-top:8px;">
            <strong>Current uploaded media:</strong><br>
            <img src="${safePath}" style="max-width:300px;height:auto;" />
          </div>
        `;
      }
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Edit Log #${log.id}</title>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:18px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:900px;
        }
        h1 { margin:0 0 8px; font-size:20px; }
        p.sub { margin:0 0 12px; font-size:13px; color:#6b7280; }
        label { font-size:13px; font-weight:500; }
        input {
          padding:7px 9px;
          font-family:inherit;
          font-size:13px;
          border-radius:10px;
          border:1px solid #d1d5db;
          width:100%;
        }
        textarea {
          width:100%;
          min-height:260px;
          padding:8px 10px;
          font-family:inherit;
          font-size:13px;
          border-radius:10px;
          border:1px solid #d1d5db;
          resize:vertical;
        }
        button {
          padding:8px 14px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-weight:500;
          cursor:pointer;
        }
        .secondary {
          background:#e5e7eb;
          color:#111827;
        }
        .field { margin-bottom:12px; }
        .label-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
        }
        .hint { font-size:11px; color:#6b7280; }
        .toolbar { margin-bottom: 8px; display:flex; flex-wrap:wrap; gap:4px; }
        .toolbar button {
          background:#f3f4f6;
          color:#111827;
          border-radius:8px;
          border:1px solid #d1d5db;
          padding:4px 8px;
          font-size:11px;
        }
        .layout {
          display:flex;
          gap:16px;
          align-items:flex-start;
        }
        .half { flex:1; min-width:0; }
        #preview {
          border:1px solid #e5e7eb;
          padding:10px;
          border-radius:10px;
          min-height:260px;
          background:#fafafa;
          font-size:13px;
        }
        h3 { margin:0 0 6px; font-size:14px; }
        a { font-size:12px; color:#6b7280; text-decoration:none; }
        a:hover { text-decoration:underline; }
        @media (max-width:800px) {
          .layout { flex-direction:column; }
        }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h1>Edit Log #${log.id}</h1>
              <p class="sub">Adjust content, associated user, and media.</p>
            </div>
            <div style="font-size:12px; color:#6b7280; text-align:right;">
              <div><a href="/">⬅ Back to logs</a></div>
            </div>
          </div>

          <form method="POST" action="/edit/${log.id}" enctype="multipart/form-data">
            <div class="field">
              <div class="label-row">
                <label>Username (text, should match an account)</label>
              </div>
              <input type="text" name="username" value="${safeUsername}" required />
            </div>

            <div class="field">
              <div class="label-row"><label>Date</label></div>
              <input type="date" name="date" value="${safeDate}" required />
            </div>

            <div class="field">
              <div class="label-row"><label>Hours Worked</label></div>
              <input type="number" step="0.1" name="hours" value="${log.hours}" required />
            </div>

            <div class="field">
              <div class="label-row"><label>Image URL (optional)</label></div>
              <input type="url" name="image_url" value="${safeImageUrl}" />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Upload Image/Video (optional, replaces existing upload)</label>
                <span class="hint">Upload to overwrite any currently attached media.</span>
              </div>
              <input type="file" name="media" accept="image/*,video/*" />
              ${currentMediaHtml}
            </div>

            <div class="field">
              <div class="label-row">
                <label>Log (Markdown, with paste-images)</label>
                <span class="hint">Paste images directly; use "Resize Img" to adjust width.</span>
              </div>

              <div class="toolbar">
                <button type="button" onclick="applyWrap('**','**')"><b>B</b></button>
                <button type="button" onclick="applyWrap('*','*')"><i>I</i></button>
                <button type="button" onclick="applyPrefix('## ')">H2</button>
                <button type="button" onclick="applyPrefix('- ')">• List</button>
                <button type="button" onclick="applyWrap('\`','\`')">Code</button>
                <button type="button" onclick="insertLink()">Link</button>
                <button type="button" onclick="insertImage()">Image URL</button>
                <button type="button" onclick="resizeImage()">Resize Img</button>
              </div>

              <div class="layout">
                <div class="half">
                  <h3>Editor</h3>
                  <textarea id="content" name="content">${safeContent}</textarea>
                </div>
                <div class="half">
                  <h3>Live Preview</h3>
                  <div id="preview"></div>
                </div>
              </div>
            </div>

            <div style="margin-top:14px; display:flex; gap:10px; align-items:center;">
              <button type="submit">Update Log</button>
              <a href="/" class="secondary">Cancel</a>
            </div>
          </form>
        </div>
      </div>

      <script>
        const textarea = document.getElementById("content");
        const preview = document.getElementById("preview");

        function updatePreview() {
          const text = textarea.value || "Start typing to see a preview...";
          preview.innerHTML = marked.parse(text);
        }

        textarea.addEventListener("input", updatePreview);
        updatePreview();

        textarea.addEventListener("paste", async (event) => {
          const items = event.clipboardData?.items || [];
          for (const item of items) {
            if (item.type && item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              try {
                const res = await fetch("/upload-inline", {
                  method: "POST",
                  body: formData
                });
                const data = await res.json();
                if (!data.url) return;
                const before = textarea.value.slice(0, textarea.selectionStart);
                const after = textarea.value.slice(textarea.selectionEnd);
                const insertion = "\\n<img src=\\"" + data.url + "\\" style=\\"max-width:100%; width:400px;\\" />\\n";
                const nextPos = before.length + insertion.length;
                textarea.value = before + insertion + after;
                textarea.selectionStart = textarea.selectionEnd = nextPos;
                updatePreview();
              } catch (e) {
                alert("Failed to upload pasted image.");
              }
              return;
            }
          }
        });

        function applyWrap(before, after) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
          const selected = value.slice(start, end) || "text";
          const replacement = before + selected + after;

          textarea.setRangeText(replacement, start, end, "end");
          textarea.focus();
          updatePreview();
        }

        function applyPrefix(prefix) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;

          const before = value.slice(0, start);
          const selected = value.slice(start, end) || "text";
          const after = value.slice(end);

          const lines = selected.split("\\n").map(line => prefix + line);
          const replacement = lines.join("\\n");

          textarea.value = before + replacement + after;
          const cursorPos = before.length + replacement.length;
          textarea.selectionStart = textarea.selectionEnd = cursorPos;
          textarea.focus();
          updatePreview();
        }

        function insertLink() {
          const url = prompt("Enter URL:", "https://");
          if (!url) return;

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
          const selected = value.slice(start, end) || "link text";

          const replacement = "[" + selected + "](" + url + ")";

          textarea.setRangeText(replacement, start, end, "end");
          textarea.focus();
          updatePreview();
        }

        function insertImage() {
          const url = prompt("Enter image URL:", "https://");
          if (!url) return;

          const alt = prompt("Alt text (optional):", "") || "image";

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          const replacement = "![" + alt + "](" + url + ")";

          textarea.setRangeText(replacement, start, end, "end");
          textarea.focus();
          updatePreview();
        }

        function resizeImage() {
          const width = prompt("Image width in px (e.g. 400):", "400");
          if (!width) return;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
          let selected = value.slice(start, end);

          if (!selected) {
            alert("Select an <img> tag or image URL to resize.");
            return;
          }

          if (!selected.includes("<img")) {
            const url = selected.trim();
            selected = '<img src="' + url + '" style="max-width:100%; width:' + width + 'px;" />';
          } else {
            if (selected.includes("style=")) {
              selected = selected.replace(/width:\\s*[^;"]+/i, 'width:' + width + 'px');
            } else {
              selected = selected.replace(
                "<img",
                '<img style="max-width:100%; width:' + width + 'px;"'
              );
            }
          }

          textarea.setRangeText(selected, start, end, "end");
          textarea.focus();
          updatePreview();
        }
      </script>
    </body>
    </html>
    `);
  });
});

// ---------- Create new log ----------
app.post("/new", upload.single("media"), (req, res) => {
  const currentUser = getCurrentUser(req);
  const admin = isAdmin(req);
  const userNameForLog = currentUser || (admin ? "admin" : null);
  if (!userNameForLog) {
    res.redirect("/login");
    return;
  }

  const { date, hours, content, image_url } = req.body;

  let mediaPath = null;
  let mediaType = null;

  if (req.file) {
    mediaPath = "/uploads/" + req.file.filename;
    if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
      mediaType = "video";
    } else {
      mediaType = "image";
    }
  }

  db.run(
    "INSERT INTO logs (date, hours, content, image_url, media_path, media_type, username) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [date, hours, content, image_url || null, mediaPath, mediaType, userNameForLog],
    () => res.redirect("/")
  );
});

// ---------- Edit existing log (admin only) ----------
app.post("/edit/:id", upload.single("media"), (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).send("Forbidden");
    return;
  }

  const id = req.params.id;
  const { date, hours, content, image_url, username } = req.body;

  db.get(
    "SELECT media_path, media_type FROM logs WHERE id = ?",
    [id],
    (err, row) => {
      let mediaPath = row ? row.media_path : null;
      let mediaType = row ? row.media_type : null;

      if (req.file) {
        mediaPath = "/uploads/" + req.file.filename;
        if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else {
          mediaType = "image";
        }
      }

      db.run(
        "UPDATE logs SET date = ?, hours = ?, content = ?, image_url = ?, media_path = ?, media_type = ?, username = ? WHERE id = ?",
        [date, hours, content, image_url || null, mediaPath, mediaType, username || null, id],
        () => res.redirect("/")
      );
    }
  );
});

// ---------- Delete log (admin only) ----------
app.post("/delete/:id", (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).send("Forbidden");
    return;
  }

  const id = req.params.id;
  db.run("DELETE FROM logs WHERE id = ?", [id], () => res.redirect("/"));
});

// ---------- Admin: missed hours per day ----------
app.get("/admin/missed", (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).send("Forbidden");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const date = req.query.date || today;

  const sql = `
    SELECT u.username,
           COALESCE(SUM(l.hours), 0) AS total_hours
    FROM users u
    LEFT JOIN logs l
      ON l.username = u.username
     AND l.date = ?
    GROUP BY u.username
    ORDER BY u.username
  `;

  db.all(sql, [date], (err, rows) => {
    if (err) {
      res.status(500).send("DB error");
      return;
    }

    const rowsHtml = rows
      .map((r) => {
        const missed = (Number(r.total_hours) || 0) <= 0;
        return `
          <tr class="${missed ? "missed" : ""}">
            <td>@${escapeHtml(r.username)}</td>
            <td>${(Number(r.total_hours) || 0).toFixed(2)}</td>
            <td>${missed ? "Yes" : ""}</td>
          </tr>
        `;
      })
      .join("");

    const missedList =
      rows
        .filter((r) => (Number(r.total_hours) || 0) <= 0)
        .map((r) => "@"+escapeHtml(r.username))
        .join(", ") || "None 🎉";

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Missed Hours</title>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:16px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:720px;
        }
        h1 { margin:0 0 8px; font-size:20px; }
        p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
        label { font-size:13px; font-weight:500; }
        input[type="date"] {
          padding:6px 8px;
          border-radius:10px;
          border:1px solid #d1d5db;
          font-family:inherit;
          font-size:13px;
        }
        button {
          padding:6px 12px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-size:13px;
          cursor:pointer;
          margin-left:6px;
        }
        table {
          width:100%;
          border-collapse:collapse;
          margin-top:12px;
          font-size:13px;
        }
        th, td {
          padding:6px 4px;
          border-bottom:1px solid #e5e7eb;
          text-align:left;
        }
        th { font-weight:600; color:#4b5563; }
        tr.missed td {
          background:#fef2f2;
          color:#b91c1c;
        }
        .top-link { margin-bottom:10px; font-size:12px; }
        .missed-summary { margin-top:10px; font-size:13px; }
        a { font-size:12px; color:#6b7280; text-decoration:none; }
        a:hover { text-decoration:underline; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div class="top-link"><a href="/">⬅ Back to logs</a></div>
          <h1>Missed Hours</h1>
          <p class="sub">See which users logged zero hours on a specific day.</p>

          <form method="GET" action="/admin/missed" style="margin-bottom:8px;">
            <label for="date">Date</label>
            <input type="date" id="date" name="date" value="${escapeHtml(
              date
            )}" />
            <button type="submit">Refresh</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Total Hours (${escapeHtml(date)})</th>
                <th>Missed?</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                '<tr><td colspan="3">No users in the system yet.</td></tr>'
              }
            </tbody>
          </table>

          <div class="missed-summary">
            <strong>Users with 0 hours:</strong> ${missedList}
          </div>
        </div>
      </div>
    </body>
    </html>
    `);
  });
});

// ---------- Admin: backups & restore ----------
app.get("/admin/backups", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }

  let backupFiles = [];
  if (fs.existsSync(backupsDir)) {
    const names = fs.readdirSync(backupsDir);
    backupFiles = names
      .filter((n) => n.toLowerCase().endsWith(".zip"))
      .map((name) => {
        const full = path.join(backupsDir, name);
        const stat = fs.statSync(full);
        return {
          name,
          size: stat.size,
          mtime: stat.mtime,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
  }

  const backupsHtml =
  backupFiles
    .map((b) => {
      const sizeHuman = formatBytes(b.size);
      const dateStr = b.mtime.toISOString().replace("T", " ").split(".")[0];
      const encoded = encodeURIComponent(b.name);
      return `
          <tr>
            <td>${escapeHtml(b.name)}</td>
            <td>${escapeHtml(dateStr)}</td>
            <td>${sizeHuman}</td>
            <td style="white-space:nowrap;">
              <a href="/admin/backups/download/${encoded}">Download</a>
            </td>
            <td>
              <form method="POST" action="/admin/backups/restore/${encoded}" onsubmit="return confirm('Restore from this backup and restart the server?');">
                <button type="submit">Restore</button>
              </form>
            </td>
            <td>
              <form method="POST" action="/admin/backups/delete/${encoded}" onsubmit="return confirm('Delete this backup file? This cannot be undone.');">
                <button type="submit" style="background:#e11d48; border-radius:999px; border:none; color:white; padding:4px 10px; font-size:12px; cursor:pointer;">Delete</button>
              </form>
            </td>
          </tr>
        `;
    })
    .join("") || '<tr><td colspan="6">No backups yet.</td></tr>';


  const dbSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
  const uploadsSize = getDirectorySize(uploadDir);
  const backupsSize = backupFiles.reduce((sum, b) => sum + b.size, 0);
  const totalUsed = dbSize + uploadsSize + backupsSize;

  getDiskUsage((_, disk) => {
    const usedStr = formatBytes(totalUsed);
    const dbStr = formatBytes(dbSize);
    const uploadsStr = formatBytes(uploadsSize);
    const backupsStr = formatBytes(backupsSize);

    let diskHtml = "";
    if (disk && disk.totalBytes && disk.freeBytes >= 0) {
      const totalStr = formatBytes(disk.totalBytes);
      const freeStr = formatBytes(disk.freeBytes);
      const usedPercent = ((totalUsed / disk.totalBytes) * 100).toFixed(1);
      diskHtml = `
        <p class="sub">
          <strong>Logger data usage:</strong> ${usedStr} (${usedPercent}% of disk)<br>
          <strong>Disk total:</strong> ${totalStr}<br>
          <strong>Disk free:</strong> ${freeStr}
        </p>
      `;
    } else {
      diskHtml = `
        <p class="sub">
          <strong>Logger data usage:</strong> ${usedStr}<br>
          <span>Disk total/free: unknown (system command not available)</span>
        </p>
      `;
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Backups &amp; Restore</title>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:16px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:820px;
        }
        h1 { margin:0 0 8px; font-size:20px; }
        h2 { margin:16px 0 8px; font-size:16px; }
        p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
        label { font-size:13px; font-weight:500; }
        input[type="file"] {
          font-size:13px;
        }
        button {
          padding:6px 12px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-size:13px;
          cursor:pointer;
          margin-left:6px;
        }
        table {
          width:100%;
          border-collapse:collapse;
          margin-top:8px;
          font-size:13px;
        }
        th, td {
          padding:6px 4px;
          border-bottom:1px solid #e5e7eb;
          text-align:left;
        }
        th { font-weight:600; color:#4b5563; }
        a { font-size:12px; color:#2563eb; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .top-link { margin-bottom:10px; font-size:12px; }
        .stats {
          margin-top:6px;
          font-size:12px;
          color:#4b5563;
        }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div class="top-link"><a href="/">⬅ Back to logs</a></div>
          <h1>Backups &amp; Restore</h1>
          <p class="sub">Create a full backup of your database + uploads, download them, and restore when needed. Restore will restart the server.</p>

          ${diskHtml}

          <div class="stats">
            <strong>Breakdown:</strong><br>
            DB: ${dbStr} · Uploads: ${uploadsStr} · Backups: ${backupsStr}
          </div>

          <h2>Create Backup</h2>
          <form method="POST" action="/admin/backups/create">
            <button type="submit">Create New Backup</button>
          </form>

          <h2>Existing Backups</h2>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Date</th>
                <th>Size</th>
                <th>Download</th>
                <th>Restore</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              ${backupsHtml}
            </tbody>
          </table>

          <h2 style="margin-top:18px;">Restore from Uploaded File</h2>
          <p class="sub">Upload a backup .zip created by this tool to restore to that state. The server will restart after restore.</p>
          <form method="POST" action="/admin/backups/restore-upload" enctype="multipart/form-data" onsubmit="return confirm('Restore from uploaded backup and restart the server?');">
            <input type="file" name="backupFile" accept=".zip" required />
            <button type="submit">Upload &amp; Restore</button>
          </form>
        </div>
      </div>
    </body>
    </html>
    `);
  });
});

app.post("/admin/backups/create", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }

  createBackup((err) => {
    if (err) {
      console.error("Backup error:", err);
      return res.send(
        "Backup error: " + escapeHtml(String(err)) + ' <a href="/admin/backups">Back</a>'
      );
    }
    res.redirect("/admin/backups");
  });
});

app.get("/admin/backups/download/:file", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }
  const name = path.basename(req.params.file);
  const full = path.join(backupsDir, name);
  if (!fs.existsSync(full)) {
    return res.status(404).send("Backup not found");
  }
  res.download(full);
});

app.post("/admin/backups/restore/:file", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }

  const name = path.basename(req.params.file);
  const full = path.join(backupsDir, name);
  if (!fs.existsSync(full)) {
    return res.status(404).send("Backup not found");
  }

  // Send response first, then perform restore and restart
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restoring Backup</title>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:16px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:420px;
          text-align:center;
        }
        h1 { margin:0 0 8px; font-size:20px; }
        p { margin:0 0 8px; font-size:13px; color:#6b7280; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <h1>Restoring Backup...</h1>
          <p>The server will restart automatically after restore.</p>
          <p>Please wait a few seconds, then refresh your browser.</p>
        </div>
      </div>
    </body>
    </html>
  `);

  setTimeout(() => {
    restoreFromBackup(full, (err) => {
      if (err) {
        console.error("Restore error:", err);
        process.exit(1);
      } else {
        restartSelf();
      }
    });
  }, 200);
});
app.post("/admin/backups/delete/:file", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }

  const name = path.basename(req.params.file); // prevent path traversal
  const full = path.join(backupsDir, name);

  if (!fs.existsSync(full)) {
    return res.status(404).send("Backup not found");
  }

  fs.unlink(full, (err) => {
    if (err) {
      console.error("Error deleting backup:", err);
      return res
        .status(500)
        .send(
          "Error deleting backup: " +
            escapeHtml(String(err)) +
            ' <a href="/admin/backups">Back</a>'
        );
    }

    res.redirect("/admin/backups");
  });
});

app.post("/admin/backups/restore-upload", upload.single("backupFile"), (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send("Forbidden");
  }
  if (!req.file) {
    return res.send(
      'No file uploaded. <a href="/admin/backups">Back</a>'
    );
  }

  const full = req.file.path;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restoring Backup</title>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
        .card {
          background:white;
          padding:22px 24px;
          border-radius:16px;
          border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(15,23,42,0.08);
          width:100%;
          max-width:420px;
          text-align:center;
        }
        h1 { margin:0 0 8px; font-size:20px; }
        p { margin:0 0 8px; font-size:13px; color:#6b7280; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <h1>Restoring Uploaded Backup...</h1>
          <p>The server will restart automatically after restore.</p>
          <p>Please wait a few seconds, then refresh your browser.</p>
        </div>
      </div>
    </body>
    </html>
  `);

  setTimeout(() => {
    restoreFromBackup(full, (err) => {
      if (err) {
        console.error("Restore error:", err);
        process.exit(1);
      } else {
        restartSelf();
      }
    });
  }, 200);
});

// ---------- Start server ----------
app.listen(3000, () =>
  console.log("Daily Logger running at http://localhost:3000")
);
