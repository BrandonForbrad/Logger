const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');

function adminPanelPage() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Admin Panel</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell {
        min-height:100vh;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        padding:24px 12px;
      }
      .card {
        background:white;
        padding:22px 24px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:600px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }

      a { text-decoration:none; }
      a:hover { text-decoration:underline; }

      .top-link { margin-bottom:10px; font-size:12px; }

      .btn-row {
        display:flex;
        flex-direction:column;
        gap:8px;
        margin-top:12px;
      }

      .pill-button {
        border-radius:999px;
        border:1px solid #d1d5db;
        padding:8px 14px;
        font-size:13px;
        font-weight:500;
        cursor:pointer;
        background:#f9fafb;
        color:#111827;
        display:inline-flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }
      .pill-button span.label {
        display:inline-block;
      }
      .pill-button span.desc {
        font-size:11px;
        color:#6b7280;
      }
      .pill-button-primary {
        background:#00a2ff;
        border-color:#00a2ff;
        color:white;
      }
      .pill-button-primary span.desc {
        color:#e0f2ff;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/">⬅ Back to logs</a></div>
        <h1>Admin Panel</h1>
        <p class="sub">
          Central place for all admin tools: users, passwords, backups, and missed-hours checks.
        </p>

        <div class="btn-row">
          <a href="/admin/users" class="pill-button pill-button-primary">
            <span class="label">Manage Users</span>
            <span class="desc">Create, reset, or delete user accounts &amp; set DefaultPassword</span>
          </a>

          <a href="/admin/missed" class="pill-button">
            <span class="label">Missed Hours</span>
            <span class="desc">See which users logged 0 hours for a given day</span>
          </a>

          <a href="/admin/backups" class="pill-button">
            <span class="label">Backups &amp; Restore</span>
            <span class="desc">Create, download, restore, or delete backups</span>
          </a>

          <a href="/admin/password" class="pill-button">
            <span class="label">Admin Password</span>
            <span class="desc">Change the admin login password</span>
          </a>

          <a href="/admin/discord" class="pill-button">
            <span class="label">Discord Integration</span>
            <span class="desc">Set up Discord bot for DM notifications on @mentions</span>
          </a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}


function adminChangePasswordPage() {
  return `
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
  `;
}


function manageUsersPage({ usersHtml, DEFAULT_PASSWORD, CONTACT_EMAIL, CONTACT_DISCORD }) {
  return `
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
            <a href="/admin/legal-hold">Legal Hold</a>
          </div>

          <h2>DefaultPassword</h2>
          <p class="sub">Users created with an empty password will log in using this default password once, then be forced to set their own.</p>
          <form method="POST" action="/admin/settings/default-password" style="margin-bottom:14px;">
            <label>DefaultPassword</label><br>
            <input type="text" name="default_password" value="${DEFAULT_PASSWORD}" />
            <button type="submit" style="margin-left:6px;">Save Default</button>
          </form>
        <h2>Contact Info (Disputes)</h2>
          <p class="sub">
            This email and Discord handle are shown to users as the official place to dispute logs or edits.
          </p>
          <form method="POST" action="/admin/settings/contact" style="margin-bottom:14px;">
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              <div style="flex:1; min-width:160px;">
                <label>Contact Email</label><br>
                <input type="email" name="contact_email" value="${CONTACT_EMAIL}" />
              </div>
              <div style="flex:1; min-width:160px;">
                <label>Contact Discord</label><br>
                <input type="text" name="contact_discord" value="${CONTACT_DISCORD}" />
              </div>
              <div>
                <button type="submit">Save Contact Info</button>
              </div>
            </div>
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
                <th>Admin</th>
                <th>Reset Password</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              ${usersHtml || '<tr><td colspan="4">No users yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
    `;
}


function legalHoldPage({ isOn }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Legal Hold</title>
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
        button {
          padding:8px 14px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-weight:500;
          cursor:pointer;
          width:100%;
          margin-top:8px;
        }
        a { font-size:12px; color:#6b7280; text-decoration:none; }
        a:hover { text-decoration:underline; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <p><a href="/">⬅ Back to logs</a></p>
          <h1>Legal Hold</h1>
          <p class="sub">
            When Legal Hold is enabled, log deletion is blocked.
            This is used when a dispute, audit, or investigation is reasonably expected.
          </p>
          <form method="POST" action="/admin/legal-hold">
            <label>
              <input type="checkbox" name="on" value="1" ${isOn ? "checked" : ""} />
              Enable Legal Hold (block all deletions)
            </label>
            <button type="submit">Save</button>
          </form>
          <p class="sub" style="margin-top:10px;">
            Current status: <strong>${isOn ? "ON" : "OFF"}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
}


function adminMissedHoursPage({ dateEscaped, rowsHtml, missedList }) {
  return `
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
            <input type="date" id="date" name="date" value="${dateEscaped}" />
            <button type="submit">Refresh</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Total Hours (${dateEscaped})</th>
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
    `;
}


function adminBackupsPage({ diskHtml, dbStr, uploadsStr, backupsStr, backupsHtml }) {
  return `
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
        ${uploadOverlayCss()}
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
          <form method="POST" action="/admin/backups/restore-upload" enctype="multipart/form-data" data-upload-progress data-upload-ui-version="2026-01-02" onsubmit="return confirm('Restore from uploaded backup and restart the server?');">
            <input type="file" name="backupFile" accept=".zip" required />
            <button type="submit">Upload &amp; Restore</button>
          </form>
        </div>
      </div>

      ${uploadOverlayHtml()}

      <script>
        ${uploadOverlayClientJs()}
        if (window.__dlUpload) window.__dlUpload.bindAll();
      </script>
    </body>
    </html>
    `;
}


function restoringBackupPage() {
  return `
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
  `;
}


function restoringUploadedBackupPage() {
  return `
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
  `;
}

// ==================== SYSTEMS VIEWS ====================

function discordSetupPage({ botToken, clientId, clientSecret, redirectUri, forceDiscord, message, usersWithDiscord }) {
  const msgHtml = message
    ? `<div class="msg ${message.type === 'error' ? 'msg-error' : 'msg-ok'}">${message.text}</div>`
    : '';

  const usersRows = (usersWithDiscord || []).map(u =>
    `<tr>
       <td>@${u.username}</td>
       <td>${u.discord_username ? u.discord_username + ' <span style="color:#9ca3af;">' + u.discord_id + '</span>' : u.discord_id || '<span style="color:#9ca3af;">Not set</span>'}</td>
     </tr>`
  ).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Discord Integration</title>
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
        max-width:640px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      h2 { margin:18px 0 8px; font-size:16px; border-bottom:1px solid #e5e7eb; padding-bottom:6px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; display:block; margin-bottom:4px; }
      input[type="text"], input[type="password"] {
        padding:8px 10px;
        width:100%;
        margin:0 0 12px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
        font-size:13px;
        box-sizing:border-box;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        font-size:13px;
      }
      button.secondary {
        background:#6b7280;
        margin-left:6px;
      }
      button.danger {
        background:#e11d48;
        margin-left:6px;
      }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; font-size:12px; }
      .msg { padding:8px 12px; border-radius:8px; font-size:13px; margin-bottom:12px; }
      .msg-ok { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
      .msg-error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
      .steps { font-size:13px; color:#374151; line-height:1.7; }
      .steps ol { padding-left:18px; margin:6px 0 0; }
      .steps li { margin-bottom:8px; }
      .steps code {
        background:#f3f4f6;
        padding:1px 5px;
        border-radius:4px;
        font-size:12px;
        color:#1f2937;
      }
      .steps a { font-size:13px; color:#2563eb; }
      table { width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }
      th, td { text-align:left; padding:6px 8px; border-bottom:1px solid #e5e7eb; }
      th { font-weight:600; color:#374151; }
      .badge {
        display:inline-block;
        padding:2px 8px;
        border-radius:999px;
        font-size:11px;
        font-weight:600;
      }
      .badge-on { background:#dcfce7; color:#166534; }
      .badge-off { background:#fef2f2; color:#991b1b; }
      #testResult { margin-top:8px; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/admin/panel">⬅ Back to Admin Panel</a></div>
        <h1>Discord Integration</h1>
        <p class="sub">
          Send Discord DMs to users when they are @mentioned in chat or assigned to a task.
          <span class="badge ${botToken ? 'badge-on' : 'badge-off'}">${botToken ? 'Connected' : 'Not configured'}</span>
        </p>

        ${msgHtml}

        <h2>Setup Instructions</h2>
        <div class="steps">
          <ol>
            <li>Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener">Discord Developer Portal</a> and click <strong>New Application</strong>.</li>
            <li>Give it a name (e.g. "Daily Logger Bot") and click <strong>Create</strong>.</li>
            <li>Go to the <strong>Bot</strong> tab on the left sidebar.</li>
            <li>Click <strong>Reset Token</strong> to generate a new bot token. Copy it and paste it below.</li>
            <li>Under <strong>Privileged Gateway Intents</strong>, enable <strong>Server Members Intent</strong>.</li>
            <li>
              <strong>Invite the bot to your Discord server:</strong>
              <ol style="margin-top:4px;">
                <li>In the Developer Portal, go to <strong>Installation</strong> on the left sidebar.</li>
                <li>Under <strong>Installation Contexts</strong>, uncheck "User Install" and keep only <strong>Guild Install</strong> checked.</li>
                <li>Under <strong>Default Install Settings → Guild Install</strong>, click the <strong>Scopes</strong> dropdown and select <code>bot</code>.</li>
                <li>In the <strong>Permissions</strong> dropdown that appears, select <code>Send Messages</code>.</li>
                <li>Scroll up and copy the <strong>Install Link</strong> shown near the top of the page (labeled "Discord Provided Link").</li>
                <li>Open that link in your browser. You'll see a prompt to select a server — choose your Discord server from the dropdown and click <strong>Continue</strong>, then <strong>Authorize</strong>.</li>
              </ol>
            </li>
            <li>Users must share a Discord server with the bot AND have DMs from server members enabled.<br>
              To check: in Discord, right-click the server icon → <strong>Privacy Settings</strong> → make sure <strong>Direct Messages</strong> is toggled on.</li>
            <li>
              <strong>Enable OAuth2 (auto-linking):</strong> So users can link their Discord with one click instead of manually entering their ID:
              <ol style="margin-top:4px;">
                <li>In the Developer Portal, go to <strong>OAuth2</strong> on the left sidebar.</li>
                <li>Copy the <strong>Client ID</strong> and paste it below.</li>
                <li>Click <strong>Reset Secret</strong> to generate a Client Secret. Copy it and paste it below.</li>
                <li>Under <strong>Redirects</strong>, click <strong>Add Redirect</strong> and enter:<br>
                  <code>${redirectUri || 'http://localhost:3000/auth/discord/callback'}</code></li>
              </ol>
            </li>
            <li>Each user can then click <strong>"Link with Discord"</strong> on their Profile page to auto-link, or manually enter their Discord User ID.</li>
          </ol>
        </div>

        <h2>Bot Token</h2>
        <form method="POST" action="/admin/discord">
          <label>Discord Bot Token</label>
          <input type="password" name="bot_token" value="${botToken || ''}" placeholder="Paste your bot token here" />
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="submit">Save Token</button>
            <button type="button" class="secondary" onclick="testBot()">Test Connection</button>
            ${botToken ? '<button type="submit" name="remove" value="1" class="danger">Remove Token</button>' : ''}
          </div>
          <div id="testResult"></div>
        </form>

        <h2>OAuth2 Settings <span style="font-size:11px;color:#6b7280;font-weight:normal;">(for auto-linking)</span></h2>
        <form method="POST" action="/admin/discord/oauth">
          <label>Client ID</label>
          <input type="text" name="client_id" value="${clientId || ''}" placeholder="Your application's Client ID" style="padding:8px 10px;width:100%;margin:0 0 12px;border-radius:10px;border:1px solid #d1d5db;font-family:inherit;font-size:13px;box-sizing:border-box;" />
          <label>Client Secret</label>
          <input type="password" name="client_secret" value="${clientSecret || ''}" placeholder="Your application's Client Secret" />
          <label style="margin-top:12px;">Redirect URI</label>
          <input type="text" value="${redirectUri || 'http://localhost:3000/auth/discord/callback'}" disabled style="padding:8px 10px;width:100%;margin:0 0 4px;border-radius:10px;border:1px solid #e5e7eb;font-family:inherit;font-size:13px;box-sizing:border-box;background:#f9fafb;color:#6b7280;" />
          <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">Add this exact URL as a Redirect in your Discord app's OAuth2 settings.</div>
          <button type="submit">Save OAuth Settings</button>
        </form>

        <h2>Linked Users</h2>
        <p class="sub">Users who have entered their Discord User ID on their Profile page.</p>
        ${usersRows
          ? `<table><thead><tr><th>Username</th><th>Discord ID</th></tr></thead><tbody>${usersRows}</tbody></table>`
          : '<p style="font-size:13px; color:#9ca3af;">No users have linked their Discord account yet.</p>'
        }

        <h2>Enforcement</h2>
        <form method="POST" action="/admin/discord/force">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px;font-weight:500;">
            <input type="checkbox" name="force_discord" value="1" ${forceDiscord ? 'checked' : ''}
              onchange="this.form.submit()"
              style="width:18px;height:18px;accent-color:#5865F2;cursor:pointer;" />
            Force Discord Integration
          </label>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;margin-left:28px;">When enabled, all non-admin users must link their Discord account before they can access the site. They will be redirected to their profile page until they link.</div>
        </form>
      </div>
    </div>
    <script>
      async function testBot() {
        const el = document.getElementById('testResult');
        el.textContent = 'Testing...';
        try {
          const res = await fetch('/admin/discord/test', { method: 'POST' });
          const data = await res.json();
          if (data.ok) {
            el.innerHTML = '<span style="color:#166534;">✓ Connected as <strong>' + data.username + '</strong></span>';
          } else {
            el.innerHTML = '<span style="color:#991b1b;">✗ ' + (data.error || 'Connection failed') + '</span>';
          }
        } catch (e) {
          el.innerHTML = '<span style="color:#991b1b;">✗ Request failed</span>';
        }
      }
    </script>
  </body>
  </html>
  `;
}


module.exports = {
  adminPanelPage,
  adminChangePasswordPage,
  manageUsersPage,
  legalHoldPage,
  adminMissedHoursPage,
  adminBackupsPage,
  restoringBackupPage,
  restoringUploadedBackupPage,
  discordSetupPage,
};
