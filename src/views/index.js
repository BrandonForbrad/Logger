function adminSetupPage() {
  return `
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
  `;
}

function policyPage({ CONTACT_EMAIL, CONTACT_DISCORD }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Timekeeping Policy</title>
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
      h2 { margin:16px 0 6px; font-size:15px; }
      p, li { font-size:13px; color:#374151; }
      ul { padding-left:18px; }
      p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
      a { font-size:12px; color:#2563eb; text-decoration:none; }
      a:hover { text-decoration:underline; }
      code { font-size:12px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div style="margin-bottom:10px; font-size:12px;">
          <a href="/">⬅ Back to logs</a>
        </div>
        <h1>Timekeeping &amp; Work Log Policy</h1>
        <p class="sub">Last updated: ${new Date().toISOString().split("T")[0]}</p>

        <h2>Purpose</h2>
        <p>Daily Logger is used to record work performed, including hours and descriptions of tasks. These logs may be treated as official work records for internal use, including (for example) payroll, performance review, and legal purposes.</p>

        <h2>Your Responsibilities</h2>
        <ul>
          <li>Submit logs that are accurate and honest to the best of your knowledge.</li>
          <li>Review your own logs regularly, including any edits made by an admin.</li>
          <li>Promptly dispute any log or edit you believe is inaccurate.</li>
        </ul>

        <p>If you disagree with a log or edit, you must raise the issue in writing (for example, email or Discord DM):</p>
        <ul>
          <li>Email: <code>${CONTACT_EMAIL}</code></li>
          <li>Discord: <code>${CONTACT_DISCORD}</code></li>
        </ul>

        <h2>Edits &amp; History</h2>
        <ul>
          <li>Admins may correct logs where there are obvious errors, inconsistencies, or rule violations.</li>
          <li>Whenever an admin edits a log, the prior version is stored in the edit history, including the previous hours, date, content, username, the editor's username, and the time of the edit.</li>
          <li>Edited logs are visibly marked as "Edited" and provide a link to review the history.</li>
        </ul>

        <h2>Disputes</h2>
        <p>If you believe a log is wrong or that an edit changed your hours incorrectly, you should:</p>
        <ol>
          <li>Review the edit history for that log.</li>
          <li>Contact us in writing at <code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code> with:
            <ul>
              <li>The log ID (e.g. #12)</li>
              <li>The date of the log</li>
              <li>What you believe is wrong and what you believe the correct hours/details should be</li>
            </ul>
          </li>
        </ol>

        <p class="sub" style="margin-top:14px;">This page is an internal policy summary and is not formal legal advice. For any legal questions or disputes, the company may consult legal counsel.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function adminLoginPage() {
  return `
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
  `;
}

function userLoginPage() {
  return `
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
  `;
}

function editLogPage({
  logId,
  safeUsername,
  safeDate,
  safeImageUrl,
  safeContent,
  hoursVal,
  CONTACT_EMAIL,
  CONTACT_DISCORD,
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Edit Log #${logId}</title>
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
        .warn {
          font-size:12px;
          color:#b91c1c;
          background:#fef2f2;
          border-radius:8px;
          padding:8px 10px;
          border:1px solid #fecaca;
          margin-bottom:10px;
        }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h1>Edit Log #${logId}</h1>
              <p class="sub">All edits are recorded with a full history of previous versions.</p>
            </div>
            <div style="font-size:12px; color:#6b7280; text-align:right;">
              <div><a href="/">⬅ Back to logs</a></div>
              <div><a href="/logs/${logId}/history">View edit history</a></div>
            </div>
          </div>

          <div class="warn">
            <strong>Note:</strong> This change will be stored in the edit history, including your username, the previous hours/date/content, and the time of the edit.
            If the original user disputes this change, they must contact us at <code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code>.
          </div>

          <form method="POST" action="/edit/${logId}" enctype="multipart/form-data">
            <div class="field">
              <div class="label-row">
                <label>User</label>
              </div>
              <input type="text" name="username" value="${safeUsername}" />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Date</label>
              </div>
              <input type="date" name="date" value="${safeDate}" required />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Hours Worked</label>
              </div>
              <input type="number" step="0.1" name="hours" value="${Number(
                hoursVal
              ).toFixed(2)}" required />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Image URL (optional)</label>
              </div>
              <input type="url" name="image_url" value="${safeImageUrl}" placeholder="https://example.com/image.png" />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Upload Image/Video (optional)</label>
                <span class="hint">Uploading a new file replaces the existing media.</span>
              </div>
              <input type="file" name="media" accept="image/*,video/*" />
            </div>

            <div class="field">
              <div class="label-row">
                <label>Log (Markdown)</label>
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
              <button type="submit">Save Changes</button>
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
      </script>
    </body>
    </html>
    `;
}

function logHistoryPage({
  logId,
  safeCurrentUser,
  safeCurrentDate,
  safeCurrentContent,
  hours,
  historyHtml,
}) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Log #${logId} &mdash; Edit History</title>
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
              max-width:840px;
            }
            h1 { margin:0 0 8px; font-size:20px; }
            h2 { margin:16px 0 8px; font-size:16px; }
            p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
            a { font-size:12px; color:#2563eb; text-decoration:none; }
            a:hover { text-decoration:underline; }
            .current {
              background:#f9fafb;
              border-radius:10px;
              padding:10px 12px;
              border:1px solid #e5e7eb;
              font-size:13px;
            }
            .current pre {
              white-space:pre-wrap;
              font-family:inherit;
              margin:6px 0 0;
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="card">
              <div style="margin-bottom:10px; font-size:12px;">
                <a href="/">⬅ Back to logs</a> ·
                <a href="/edit/${logId}">Edit this log</a>
              </div>
              <h1>Log #${logId} &mdash; Edit History</h1>
              <p class="sub">Review previous versions of this log. Each edit stores the prior state, including content, hours, date, and user.</p>

              <h2>Current Version</h2>
              <div class="current">
                <div>
                  ${
                    safeCurrentUser
                      ? `<strong>User:</strong> @${safeCurrentUser} &mdash; `
                      : ""
                  }
                  ${
                    safeCurrentDate
                      ? `<strong>Date:</strong> ${safeCurrentDate} &mdash; `
                      : ""
                  }
                  <strong>Hours:</strong> ${(Number(hours) || 0).toFixed(2)}
                </div>
                <pre>${safeCurrentContent}</pre>
              </div>

              <h2>Previous Versions</h2>
              ${historyHtml}
            </div>
          </div>
        </body>
        </html>
        `;
}

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
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

function pinnedNewPage({ currentUserEscaped }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>New Pinned Note</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .t-shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .t-card {
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
      .toolbar {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-bottom:6px;
      }
      .toolbar button {
        padding:4px 8px;
        border-radius:999px;
        font-size:12px;
        background:#e5e7eb;
        color:#111827;
      }
      .toolbar button:hover {
        background:#d1d5db;
      }
      @media (max-width:800px) {
        .layout { flex-direction:column; }
      }
    </style>
  </head>
  <body>
    <div class="t-shell">
      <div class="t-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <h1>New Pinned Note</h1>
            <p class="sub">Create a note that will be pinned at the top of the log page. Only one can be pinned at a time.</p>
          </div>
          <div style="font-size:12px; color:#6b7280; text-align:right;">
            <div>Logged in as <strong>@${currentUserEscaped}</strong></div>
            <div><a href="/">⬅ Back to logs</a></div>
          </div>
        </div>

        <form method="POST" action="/pinned/new">
          <div class="field">
            <div class="label-row">
              <label>Pinned Note (Markdown, with paste-images)</label>
              <span class="hint">Paste images directly; they’ll upload and embed automatically.</span>
            </div>

            <div class="toolbar">
              <button type="button" onclick="applyWrap('**','**')"><b>B</b></button>
              <button type="button" onclick="applyWrap('*','*')"><i>I</i></button>
              <button type="button" onclick="applyPrefix('## ')">H2</button>
              <button type="button" onclick="applyPrefix('- ')">• List</button>
              <button type="button" onclick="applyWrap('\\','\\')">Code</button>
              <button type="button" onclick="insertLink()">Link</button>
              <button type="button" onclick="insertImage()">Image URL</button>
              <button type="button" onclick="resizeImage()">Resize Img</button>
            </div>

            <div class="layout">
              <div class="half">
                <h3>Editor</h3>
                <textarea id="content" name="content" placeholder="Write your pinned note here."></textarea>
              </div>
              <div class="half">
                <h3>Live Preview</h3>
                <div id="preview"></div>
              </div>
            </div>
          </div>

          <div style="margin-top:14px; display:flex; gap:10px; align-items:center;">
            <button type="submit">Save & Pin</button>
            <a href="/" class="secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>

    <script>
      const textarea = document.getElementById("content");
      const preview = document.getElementById("preview");

      function updatePreview() {
        const text = textarea.value || "Start typing to see a preview.";
        preview.innerHTML = marked.parse(text);
      }

      textarea.addEventListener("input", updatePreview);
      updatePreview();

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

        const lines = selected.split("\n").map(line => prefix + line);
        const replacement = lines.join("\n");

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

      // Paste image support (same as log editor)
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
              const insertion = "\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\n";
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
    </script>
  </body>
  </html>
  `;
}

function pinnedHistoryPage({ itemsHtml, paginationHtml, page, totalPages }) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pinned Note History</title>
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
            max-width:840px;
          }
          h1 { margin:0 0 8px; font-size:20px; }
          p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
          a { font-size:12px; color:#2563eb; text-decoration:none; }
          a:hover { text-decoration:underline; }
          .item {
            border-radius:10px;
            border:1px solid #e5e7eb;
            padding:10px 12px;
            margin-bottom:10px;
            background:#f9fafb;
          }
          .item-header { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
          .item-title { display:flex; align-items:center; gap:6px; }
          .badge {
            display:inline-flex;
            align-items:center;
            gap:6px;
            padding:2px 8px;
            border-radius:999px;
            background:#0ea5e9;
            color:white;
            font-size:11px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:0.08em;
          }
          .badge-current {
            background:#22c55e;
          }
          .meta { font-size:11px; color:#6b7280; margin-top:2px; }
          .snippet {
            font-size:13px;
            margin-top:6px;
            white-space:pre-wrap;
          }
          .actions {
            margin-top:8px;
            display:flex;
            gap:8px;
            flex-wrap:wrap;
          }
          .btn, button {
            padding:6px 12px;
            border-radius:999px;
            border:none;
            background:#00a2ff;
            color:white;
            font-size:13px;
            cursor:pointer;
            text-decoration:none;
            display:inline-flex;
            align-items:center;
            gap:4px;
          }
          .btn-secondary {
            background:#e5e7eb;
            color:#111827;
          }

      .pagination {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      }
      .page-meta {
      font-size: 12px;
      color: #6b7280;
      }
      .disabled {
      pointer-events: none;
      opacity: 0.55;
      }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="card">
            <div style="margin-bottom:10px; font-size:12px;">
              <a href="/">⬅ Back to logs</a> ·
              <a href="/pinned/new">New pinned note</a>
            </div>
            <h1>Pinned Note History</h1>
            <p class="sub">When you create a new pinned note, the previous one is unpinned but kept here. You can repin any older note.</p>
      <div
        id="pinnedStream"
        data-page="${Number(page) || 1}"
        data-total-pages="${Number(totalPages) || 1}"
        data-base-qs=""
      >
        ${itemsHtml || ""}
      </div>
      <div id="pinnedStreamLoader" class="sub" style="display:none; margin-top:10px;">Loading more pinned notes…</div>
      ${paginationHtml || ""}
          </div>
        </div>
    <script>
      (function () {
        var stream = document.getElementById("pinnedStream");
        if (!stream) return;
        var loader = document.getElementById("pinnedStreamLoader");
        var pagination = document.querySelector(".pagination");
        if (pagination) pagination.style.display = "none";

        var currentPage = parseInt(stream.getAttribute("data-page") || "1", 10) || 1;
        var totalPages = parseInt(stream.getAttribute("data-total-pages") || "1", 10) || 1;
        var baseQs = stream.getAttribute("data-base-qs") || "";
        var loading = false;
        var done = currentPage >= totalPages;

        function buildUrl(nextPage) {
          var qs = baseQs ? baseQs + "&" : "";
          return "/pinned/history/page?" + qs + "page=" + encodeURIComponent(String(nextPage));
        }

        function nearBottom() {
          var scrollY = window.scrollY || window.pageYOffset || 0;
          var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
          var docH = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          );
          return scrollY + viewportH >= docH - 600;
        }

        async function loadMore() {
          if (loading || done) return;
          loading = true;
          if (loader) loader.style.display = "block";

          var nextPage = currentPage + 1;
          try {
            var res = await fetch(buildUrl(nextPage), {
              headers: { "Accept": "application/json" },
              credentials: "same-origin"
            });
            if (!res.ok) throw new Error("bad status");
            var data = await res.json();
            if (data && typeof data.totalPages === "number") totalPages = data.totalPages;
            if (!data || !data.itemsHtml) {
              done = true;
              return;
            }

            var tmp = document.createElement("div");
            tmp.innerHTML = data.itemsHtml;
            while (tmp.firstChild) stream.appendChild(tmp.firstChild);

            currentPage = data.page || nextPage;
            stream.setAttribute("data-page", String(currentPage));
            done = currentPage >= totalPages;
          } catch (e) {
            // keep pagination as fallback if fetch fails
            if (pagination) pagination.style.display = "flex";
            done = true;
          } finally {
            loading = false;
            if (loader) loader.style.display = "none";
          }
        }

        window.addEventListener(
          "scroll",
          function () {
            if (nearBottom()) loadMore();
          },
          { passive: true }
        );
        if (nearBottom()) loadMore();
      })();
    </script>
      </body>
      </html>
      `;
}

function pinnedEditPage({ noteId, safeUser, safeDate, safeContent }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Edit Pinned Note #${noteId}</title>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <style>
        body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
        .t-shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
        .t-card {
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
      <div class="t-shell">
        <div class="t-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h1>Edit Pinned Note #${noteId}</h1>
              <p class="sub">
                @${safeUser || "admin"}
                ${safeDate ? " · " + safeDate : ""}
              </p>
            </div>
            <div style="font-size:12px; color:#6b7280; text-align:right;">
              <div><a href="/">⬅ Back to logs</a></div>
              <div><a href="/pinned/${noteId}">View note</a></div>
            </div>
          </div>

          <form method="POST" action="/pinned/${noteId}/edit">
            <div class="field">
              <div class="label-row">
                <label>Pinned Note (Markdown, with paste-images)</label>
                <span class="hint">Changes apply to this note entry; pin state is preserved.</span>
              </div>

              <div class="toolbar">
                <button type="button" onclick="applyWrap('**','**')"><b>B</b></button>
                <button type="button" onclick="applyWrap('*','*')"><i>I</i></button>
                <button type="button" onclick="applyPrefix('## ')">H2</button>
                <button type="button" onclick="applyPrefix('- ')">• List</button>
                <button type="button" onclick="applyWrap('\\','\\')">Code</button>
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
              <button type="submit">Save Changes</button>
              <a href="/pinned/${noteId}" class="secondary">Cancel</a>
            </div>
          </form>
        </div>
      </div>

      <script>
        const textarea = document.getElementById("content");
        const preview = document.getElementById("preview");

        function updatePreview() {
          const text = textarea.value || "Start typing to see a preview.";
          preview.innerHTML = marked.parse(text);
        }

        textarea.addEventListener("input", updatePreview);
        updatePreview();

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

        // Paste image support (same as log editor)
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
                const insertion = "\\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\\n";
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
      </script>
    </body>
    </html>
    `;
}

function pinnedDetailPage({ noteId, isPinned, safeUser, safeDate, bodyHtml, admin }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pinned Note #${noteId}</title>
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
          max-width:840px;
        }
        .badge {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:2px 8px;
          border-radius:999px;
          background:#0ea5e9;
          color:white;
          font-size:11px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.08em;
        }
        .badge-secondary {
          background:#e5e7eb;
          color:#111827;
        }
        .meta { font-size:12px; color:#6b7280; margin-top:4px; }
        .note-body { margin-top:10px; font-size:13px; line-height:1.5; }
        .actions { margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; }
        button, .btn {
          padding:7px 12px;
          border-radius:999px;
          border:none;
          background:#00a2ff;
          color:white;
          font-size:13px;
          cursor:pointer;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          gap:4px;
        }
        .btn-secondary {
          background:#e5e7eb;
          color:#111827;
        }
        a { color:#2563eb; text-decoration:none; font-size:12px; }
        a:hover { text-decoration:underline; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="card">
          <div style="font-size:12px; margin-bottom:8px;">
            <a href="/">⬅ Back to logs</a> ·
            <a href="/pinned/history">Pinned note history</a>
          </div>
          <div class="badge">Pinned Note</div>
          ${
            isPinned
              ? `<span class="badge badge-secondary" style="margin-left:6px;">Currently Pinned</span>`
              : ""
          }
          <div class="meta">
            ${safeUser ? "@" + safeUser : ""}${
    safeUser && safeDate ? " · " : ""
  }${safeDate}
          </div>
          <div class="note-body">
            ${bodyHtml}
          </div>
          <div class="actions">
            <button id="copyPinnedDetailLink" data-url="/pinned/${noteId}">Copy Link</button>
            ${
              admin
                ? `<a href="/pinned/${noteId}/edit" class="btn btn-secondary">Edit</a>`
                : ""
            }
            ${
              admin && !isPinned
                ? `<form method="POST" action="/pinned/${noteId}/repin" style="margin:0;">
                     <button type="submit" class="btn">Repin this note</button>
                   </form>`
                : ""
            }
            ${
              admin
                ? `<form method="POST" action="/pinned/${noteId}/delete" style="margin:0;">
                     <button type="submit" class="btn btn-secondary" onclick="return confirm('Delete this pinned note?');">
                       Delete
                     </button>
                   </form>`
                : ""
            }
          </div>
        </div>
      </div>
      <script>
        (function() {
          const btn = document.getElementById("copyPinnedDetailLink");
          if (!btn) return;
          btn.addEventListener("click", function() {
            const rel = btn.getAttribute("data-url") || "/";
            const url = window.location.origin + rel;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url)
                .then(function() {
                  const old = btn.textContent;
                  btn.textContent = "Link copied!";
                  setTimeout(function() { btn.textContent = old; }, 1500);
                })
                .catch(function() {
                  window.prompt("Copy this URL:", url);
                });
            } else {
              window.prompt("Copy this URL:", url);
            }
          });
        })();
      </script>
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

function firstLoginSetPasswordPage({ usernameEscaped }) {
  return `
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
                  <input type="hidden" name="username" value="${usernameEscaped}" />
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
          `;
}

function newLogPage({ today, currentUserEscaped, CONTACT_EMAIL, CONTACT_DISCORD }) {
  return `
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
            <div>Logged in as <strong>@${currentUserEscaped}</strong></div>
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
        <div class="field" style="margin-top:10px;">
            <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">
              <strong>Work Log Acknowledgment</strong><br>
              By submitting this log, you confirm that:
              <ul style="margin:4px 0 0 18px; padding:0; font-size:11px;">
                <li>The hours and description are accurate to the best of your knowledge.</li>
                <li>This entry may be used as an official work record.</li>
                <li>You will review your logs and dispute any edits or changes you believe are incorrect using email or Discord DM.</li>
              </ul>
              <div style="margin-top:4px;">
                Dispute channel: <code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code>
              </div>
            </div>
            <label style="display:flex; align-items:flex-start; gap:6px; font-size:12px;">
              <input type="checkbox" name="acknowledge_official" required />
              <span>I understand this log is an official work record and that I must review and dispute any errors in writing.</span>
            </label>
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
              const insertion = "\\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\\n";
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

module.exports = {
  adminSetupPage,
  policyPage,
  adminLoginPage,
  userLoginPage,
  editLogPage,
  logHistoryPage,
  adminPanelPage,
  pinnedNewPage,
  pinnedHistoryPage,
  pinnedEditPage,
  pinnedDetailPage,
  adminChangePasswordPage,
  manageUsersPage,
  legalHoldPage,
  firstLoginSetPasswordPage,
  newLogPage,
  adminMissedHoursPage,
  adminBackupsPage,
  restoringBackupPage,
  restoringUploadedBackupPage,
};
