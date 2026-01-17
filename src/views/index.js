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

function uploadOverlayCss() {
  return `
    .upload-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.35);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
    }
    .upload-overlay .upload-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.18);
      width: 100%;
      max-width: 440px;
      padding: 16px 16px;
    }
    .upload-title {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 700;
    }
    .upload-sub {
      margin: 0 0 10px;
      font-size: 12px;
      color: #6b7280;
    }
    .upload-bar {
      height: 10px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }
    .upload-bar-fill {
      height: 100%;
      width: 0%;
      background: #00a2ff;
      transition: width 120ms linear;
    }
    .upload-meta {
      margin-top: 8px;
      font-size: 11px;
      color: #6b7280;
      font-variant-numeric: tabular-nums;
    }
  `;
}

function uploadOverlayHtml() {
  return `
    <div id="uploadOverlay" class="upload-overlay" aria-live="polite" aria-busy="true" style="display:none;">
      <div class="upload-card">
        <div class="upload-title" id="uploadTitle">Uploading…</div>
        <div class="upload-sub" id="uploadStatus">Uploading… 0%</div>
        <div class="upload-bar"><div class="upload-bar-fill" id="uploadBarFill"></div></div>
        <div class="upload-meta" id="uploadMeta"></div>
      </div>
    </div>
  `;
}

function uploadOverlayClientJs() {
  return `
    (function () {
      var VERSION = "2026-01-02-v2";
      if (window.__dlUpload && window.__dlUpload.version === VERSION) return;

      function el(id) {
        return document.getElementById(id);
      }

      function formatBytes(bytes) {
        var n = Number(bytes) || 0;
        var units = ["B", "KB", "MB", "GB", "TB"];
        var i = 0;
        while (n >= 1024 && i < units.length - 1) {
          n = n / 1024;
          i++;
        }
        var digits = i === 0 ? 0 : i === 1 ? 0 : 1;
        return n.toFixed(digits) + " " + units[i];
      }

      function showOverlay(opts) {
        opts = opts || {};
        var overlay = el("uploadOverlay");
        if (!overlay) return;
        var title = el("uploadTitle");
        var status = el("uploadStatus");
        var bar = el("uploadBarFill");
        var meta = el("uploadMeta");
        if (title) title.textContent = opts.title || "Uploading...";
        if (status) status.textContent = opts.status || "Starting...";
        if (meta) meta.textContent = opts.meta || "";
        if (bar) bar.style.width = "0%";
        overlay.style.display = "flex";
      }

      function hideOverlay() {
        var overlay = el("uploadOverlay");
        if (overlay) overlay.style.display = "none";
      }

      function setProgress(loaded, total) {
        var status = el("uploadStatus");
        var bar = el("uploadBarFill");
        var meta = el("uploadMeta");
        if (total && total > 0) {
          var pct = Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
          if (bar) bar.style.width = pct + "%";
          if (status) status.textContent = "Uploading... " + pct + "%";
          if (meta) meta.textContent = formatBytes(loaded) + " / " + formatBytes(total);
        } else {
          if (bar) bar.style.width = "25%";
          if (status) status.textContent = "Uploading...";
          if (meta) meta.textContent = formatBytes(loaded);
        }
      }

      function replaceDocumentIfHtml(text) {
        if (!text) return false;
        var t = String(text).trim();
        if (!t) return false;
        if (!(t.startsWith("<!DOCTYPE") || t.startsWith("<html") || t.startsWith("<HTML"))) return false;
        document.open();
        document.write(text);
        document.close();
        return true;
      }

      function bindForm(form) {
        if (!form) return;
        if (form.__dlUploadBound === VERSION) return;
        form.__dlUploadBound = VERSION;

        form.addEventListener("submit", function (e) {
          if (e.defaultPrevented) return;

          try {
            if (typeof form.checkValidity === "function" && !form.checkValidity()) {
              return;
            }
          } catch (err) {}

          var fileInput = form.querySelector('input[type="file"]');
          var file = (fileInput && fileInput.files && fileInput.files.length > 0) ? fileInput.files[0] : null;
          var hasFile = !!file;

          e.preventDefault();

          var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
          if (submitBtn) {
            if (!submitBtn.__origText) {
              submitBtn.__origText = (submitBtn.tagName === "INPUT") ? (submitBtn.value || "") : (submitBtn.textContent || "");
            }
            submitBtn.disabled = true;
            var btnLabel = hasFile ? "Uploading... 0%" : "Saving...";
            if (submitBtn.tagName === "INPUT") submitBtn.value = btnLabel;
            else submitBtn.textContent = btnLabel;
          }

          showOverlay({
            title: hasFile ? "Uploading..." : "Saving...",
            status: hasFile ? "Uploading... 0%" : "Saving...",
            meta: file && file.size ? ("File size: " + formatBytes(file.size)) : ""
          });

          var xhr = new XMLHttpRequest();
          xhr.open((form.method || "POST").toUpperCase(), form.action);
          xhr.withCredentials = true;

          xhr.upload.onprogress = function (evt) {
            if (!evt.lengthComputable) return;
            var pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(evt.loaded, evt.total);
            if (submitBtn) {
              var label = "Uploading... " + pct + "%";
              if (submitBtn.tagName === "INPUT") submitBtn.value = label;
              else submitBtn.textContent = label;
            }
          };

          xhr.upload.onloadend = function () {
            var status = el("uploadStatus");
            if (status) status.textContent = "Processing...";
            if (submitBtn) {
              if (submitBtn.tagName === "INPUT") submitBtn.value = "Processing...";
              else submitBtn.textContent = "Processing...";
            }
          };

          xhr.onerror = function () {
            hideOverlay();
            if (submitBtn) {
              submitBtn.disabled = false;
              if (submitBtn.tagName === "INPUT") submitBtn.value = submitBtn.__origText || "Save";
              else submitBtn.textContent = submitBtn.__origText || "Save";
            }
            alert("Upload failed (network error).");
          };

          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
              if (replaceDocumentIfHtml(xhr.responseText)) return;
              var url = xhr.responseURL;
              if (url) {
                window.location.href = url;
                return;
              }
              window.location.reload();
              return;
            }
            hideOverlay();
            if (submitBtn) {
              submitBtn.disabled = false;
              if (submitBtn.tagName === "INPUT") submitBtn.value = submitBtn.__origText || "Save";
              else submitBtn.textContent = submitBtn.__origText || "Save";
            }
            alert("Upload failed: " + xhr.status);
          };

          var fd = new FormData(form);
          xhr.send(fd);
        }, true);
      }

      function bindAll() {
        var forms = document.querySelectorAll('form[data-upload-progress], form[enctype="multipart/form-data"]');
        for (var i = 0; i < forms.length; i++) bindForm(forms[i]);
      }

      function uploadInline(file) {
        return new Promise(function (resolve, reject) {
          if (!file) return reject(new Error("no file"));
          var fd = new FormData();
          fd.append("file", file);
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/upload-inline");
          xhr.withCredentials = true;
          xhr.onerror = function () {
            reject(new Error("network error"));
          };
          xhr.onload = function () {
            if (xhr.status < 200 || xhr.status >= 400) {
              reject(new Error("upload failed: " + xhr.status));
              return;
            }
            try {
              var data = JSON.parse(xhr.responseText || "{}");
              resolve(data);
            } catch (e) {
              reject(new Error("invalid response"));
            }
          };
          xhr.send(fd);
        });
      }

      window.__dlUpload = {
        version: VERSION,
        bindAll: bindAll,
        bindForm: bindForm,
        uploadInline: uploadInline,
        show: showOverlay,
        hide: hideOverlay,
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindAll);
      } else {
        bindAll();
      }
    })();
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
        ${uploadOverlayCss()}
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

          <form method="POST" action="/edit/${logId}" enctype="multipart/form-data" data-upload-progress data-upload-ui-version="2026-01-02">
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

      ${uploadOverlayHtml()}

      <script>
        ${uploadOverlayClientJs()}
        if (window.__dlUpload) window.__dlUpload.bindAll();

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
      ${uploadOverlayCss()}
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

        <form method="POST" action="/pinned/new" enctype="multipart/form-data" data-upload-progress>
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

          <div class="field">
            <div class="label-row">
              <label>Attach Media (optional)</label>
              <span class="hint">Upload an image or video to embed in your pinned note.</span>
            </div>
            <input type="file" name="media" accept="image/*,video/*" />
          </div>

          <div style="margin-top:14px; display:flex; gap:10px; align-items:center;">
            <button type="submit">Save & Pin</button>
            <a href="/" class="secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>

      ${uploadOverlayHtml()}

    <script>
        ${uploadOverlayClientJs()}
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

      // Paste image/video support (inline upload + embed)
      textarea.addEventListener("paste", async (event) => {
        const items = event.clipboardData?.items || [];
        for (const item of items) {
          const type = item.type || "";
          if (!type.startsWith("image/") && !type.startsWith("video/")) continue;

          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          try {
            const data = window.__dlUpload
              ? await window.__dlUpload.uploadInline(file)
              : await (async () => {
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/upload-inline", {
                    method: "POST",
                    body: formData,
                  });
                  return await res.json();
                })();

            if (!data || !data.url) return;

            const before = textarea.value.slice(0, textarea.selectionStart);
            const after = textarea.value.slice(textarea.selectionEnd);
            const insertion = type.startsWith("video/")
              ? "\n<video controls style=\\\"max-width:100%; width:400px;\\\" preload=\\\"none\\\"><source src=\\\"" +
                data.url +
                "\\\" /></video>\n"
              : "\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\n";

            const nextPos = before.length + insertion.length;
            textarea.value = before + insertion + after;
            textarea.selectionStart = textarea.selectionEnd = nextPos;
            updatePreview();
          } catch (e) {
            alert("Failed to upload pasted media.");
          }
          return;
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
        ${uploadOverlayCss()}
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

      ${uploadOverlayHtml()}

      <script>
        ${uploadOverlayClientJs()}
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

        // Paste image/video support (inline upload + embed)
        textarea.addEventListener("paste", async (event) => {
          const items = event.clipboardData?.items || [];
          for (const item of items) {
            const type = item.type || "";
            if (!type.startsWith("image/") && !type.startsWith("video/")) continue;

            event.preventDefault();
            const file = item.getAsFile();
            if (!file) return;

            try {
              const data = window.__dlUpload
                ? await window.__dlUpload.uploadInline(file)
                : await (async () => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/upload-inline", {
                      method: "POST",
                      body: formData,
                    });
                    return await res.json();
                  })();

              if (!data || !data.url) return;
              const before = textarea.value.slice(0, textarea.selectionStart);
              const after = textarea.value.slice(textarea.selectionEnd);
              const insertion = type.startsWith("video/")
                ? "\\n<video controls style=\\\"max-width:100%; width:400px;\\\" preload=\\\"none\\\"><source src=\\\"" +
                  data.url +
                  "\\\" /></video>\\n"
                : "\\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\\n";

              const nextPos = before.length + insertion.length;
              textarea.value = before + insertion + after;
              textarea.selectionStart = textarea.selectionEnd = nextPos;
              updatePreview();
            } catch (e) {
              alert("Failed to upload pasted media.");
            }
            return;
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

function newLogPage({ today, currentUserEscaped, CONTACT_EMAIL, CONTACT_DISCORD, ASYNC_UPLOAD_THRESHOLD_BYTES }) {
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
      ${uploadOverlayCss()}
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

  <form method="POST" action="/new" enctype="multipart/form-data" data-upload-progress>
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
            <div id="asyncUploadHint" class="hint" style="display:none; margin-top:6px;">
              Large file detected — it will upload in a separate window after you click Save Log.
            </div>
            <div id="uploadJsStatus" class="hint" style="margin-top:6px;">
              Upload progress UI: loading…
            </div>
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

    ${uploadOverlayHtml()}

    <script>
      ${uploadOverlayClientJs()}
      if (window.__dlUpload) window.__dlUpload.bindAll();

      /* Async uploader code removed - using simple XHR upload with progress */

      const textarea = document.getElementById("content");
      const preview = document.getElementById("preview");

      function updatePreview() {
        const text = textarea.value || "Start typing to see a preview...";
        preview.innerHTML = marked.parse(text);
      }

      textarea.addEventListener("input", updatePreview);
      updatePreview();

      // Paste image/video support (inline upload + embed)
      textarea.addEventListener("paste", async (event) => {
        const items = event.clipboardData?.items || [];
        for (const item of items) {
          const type = item.type || "";
          if (!type.startsWith("image/") && !type.startsWith("video/")) continue;

          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          try {
            const data = window.__dlUpload
              ? await window.__dlUpload.uploadInline(file)
              : await (async () => {
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/upload-inline", {
                    method: "POST",
                    body: formData,
                  });
                  return await res.json();
                })();

            if (!data || !data.url) return;
            const before = textarea.value.slice(0, textarea.selectionStart);
            const after = textarea.value.slice(textarea.selectionEnd);
            const insertion = type.startsWith("video/")
              ? "\\n<video controls style=\\\"max-width:100%; width:400px;\\\" preload=\\\"none\\\"><source src=\\\"" +
                data.url +
                "\\\" /></video>\\n"
              : "\\n<img src=\\\"" + data.url + "\\\" style=\\\"max-width:100%; width:400px;\\\" />\\n";

            const nextPos = before.length + insertion.length;
            textarea.value = before + insertion + after;
            textarea.selectionStart = textarea.selectionEnd = nextPos;
            updatePreview();
          } catch (e) {
            alert("Failed to upload pasted media.");
          }
          return;
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

function uploaderPage({ currentUserEscaped, thresholdBytes }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Uploader</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
      .card {
        background:white;
        padding:18px 18px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:520px;
      }
      h1 { margin:0 0 4px; font-size:18px; }
      p.sub { margin:0 0 12px; font-size:13px; color:#6b7280; }
      .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
      input[type="file"] { font-size:13px; }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
      }
      button.secondary { background:#e5e7eb; color:#111827; }
      .bar { height:10px; background:#e5e7eb; border-radius:999px; overflow:hidden; margin-top:10px; }
      .fill { height:100%; width:0%; background:#00a2ff; transition:width 120ms linear; }
      .meta { margin-top:8px; font-size:12px; color:#6b7280; font-variant-numeric:tabular-nums; }
      .status { margin-top:6px; font-size:13px; }
      code { font-size:12px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <h1>Uploader</h1>
        <p class="sub">Logged in as <strong>@${currentUserEscaped}</strong>. This page handles large media uploads.</p>

        <div class="row" style="margin-bottom:8px;">
          <input id="file" type="file" accept="image/*,video/*" />
          <button id="start" type="button">Start Upload</button>
          <button id="close" type="button" class="secondary">Close</button>
        </div>

        <div class="bar"><div class="fill" id="fill"></div></div>
        <div class="status" id="status">Waiting for file…</div>
        <div class="meta" id="meta"></div>

        <p class="sub" style="margin-top:12px;">
          Large-upload threshold: <code>${Number(thresholdBytes) || 0}</code> bytes.
        </p>
      </div>
    </div>

    <script>
      (function () {
        var THRESHOLD = ${Number(thresholdBytes) || 0};
        var file = null;
        var uploadId = null;
        var logId = null;
        var lastProgressAt = 0;

        function qs(name) {
          try {
            var u = new URL(window.location.href);
            return u.searchParams.get(name);
          } catch (e) {
            return null;
          }
        }

        function formatBytes(bytes) {
          var n = Number(bytes) || 0;
          var units = ["B", "KB", "MB", "GB", "TB"];
          var i = 0;
          while (n >= 1024 && i < units.length - 1) { n = n / 1024; i++; }
          var digits = i === 0 ? 0 : i === 1 ? 0 : 1;
          return n.toFixed(digits) + " " + units[i];
        }

        var fileInput = document.getElementById("file");
        var startBtn = document.getElementById("start");
        var closeBtn = document.getElementById("close");
        var statusEl = document.getElementById("status");
        var metaEl = document.getElementById("meta");
        var fillEl = document.getElementById("fill");

        function setStatus(text) { if (statusEl) statusEl.textContent = text || ""; }
        function setMeta(text) { if (metaEl) metaEl.textContent = text || ""; }
        function setPct(pct) { if (fillEl) fillEl.style.width = String(pct || 0) + "%"; }

        function setFile(f) {
          file = f || null;
          if (!file) {
            setStatus("Waiting for file…");
            setMeta("");
            setPct(0);
            return;
          }
          setStatus("Ready: " + (file.name || "(unnamed)"));
          setMeta(file.size ? ("File: " + formatBytes(file.size)) : "");
          setPct(0);
        }

        function postProgress(loaded, total) {
          if (!uploadId) return;
          var now = Date.now();
          if (now - lastProgressAt < 500) return;
          lastProgressAt = now;
          try {
            var fd = new FormData();
            fd.append("loaded", String(loaded || 0));
            fd.append("total", String(total || 0));
            fetch("/uploader/" + encodeURIComponent(String(uploadId)) + "/progress", {
              method: "POST",
              body: fd,
              credentials: "same-origin"
            }).catch(function () {});
          } catch (e) {}
        }

        async function initIfNeeded() {
          if (uploadId && logId) return;
          var qUploadId = qs("uploadId");
          var qLogId = qs("logId");
          uploadId = qUploadId ? Number(qUploadId) : null;
          logId = qLogId ? Number(qLogId) : null;
        }

        function startUpload() {
          if (!file) { setStatus("Pick a file first."); return; }
          if (!uploadId) { setStatus("Missing uploadId (open via the New Log page)."); return; }

          startBtn.disabled = true;
          setStatus("Uploading… 0%");

          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/uploader/" + encodeURIComponent(String(uploadId)));
          xhr.withCredentials = true;

          xhr.upload.onprogress = function (evt) {
            var total = (evt && evt.lengthComputable && evt.total > 0) ? evt.total : (file && file.size ? file.size : 0);
            var pct = total > 0 ? Math.max(0, Math.min(100, Math.round((evt.loaded / total) * 100))) : 0;
            setPct(pct);
            setStatus(total > 0 ? ("Uploading… " + pct + "%") : "Uploading…");
            setMeta(total > 0 ? (formatBytes(evt.loaded) + " / " + formatBytes(total)) : formatBytes(evt.loaded));
            postProgress(evt.loaded, total);
          };
          xhr.upload.onloadend = function () {
            setStatus("Processing…");
          };
          xhr.onerror = function () {
            startBtn.disabled = false;
            setStatus("Upload failed (network error)");
          };
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
              setPct(100);
              setStatus("Upload complete. You can close this window.");
              return;
            }
            startBtn.disabled = false;
            setStatus("Upload failed: " + xhr.status);
          };

          var fd = new FormData();
          fd.append("media", file);
          xhr.send(fd);
        }

        fileInput.addEventListener("change", function () {
          var f = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
          setFile(f);
        });

        startBtn.addEventListener("click", function () {
          startUpload();
        });

        closeBtn.addEventListener("click", function () {
          try { window.close(); } catch (e) {}
        });

        // Receive file + ids from the /new page.
        window.addEventListener("message", function (event) {
          try {
            if (event.origin !== window.location.origin) return;
            var data = event.data || {};
            if (!data || data.type !== "DL_UPLOAD_INIT") return;
            uploadId = Number(data.uploadId) || uploadId;
            logId = Number(data.logId) || logId;
            if (data.file) setFile(data.file);
            if (data.autoStart) {
              setTimeout(function () { startUpload(); }, 50);
            }
          } catch (e) {}
        });

        // Init from query params if present.
        initIfNeeded().then(function () {
          if (uploadId) setStatus("Waiting for file… (uploadId=" + uploadId + ")");
        });

        try {
          if (window.opener && window.opener.postMessage) {
            window.opener.postMessage({ type: 'DL_UPLOADER_READY' }, window.location.origin);
          }
        } catch (e) {}
      })();
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

function systemsBaseCss() {
  return `
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #f8fafc; color: #1e293b; }
    * { box-sizing: border-box; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    .navbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand { font-weight: 700; font-size: 18px; color: #0f172a; }
    .navbar-links { display: flex; gap: 16px; margin-left: auto; }
    .navbar-links a { font-size: 14px; color: #64748b; font-weight: 500; }
    .navbar-links a:hover { color: #0f172a; }
    
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .page-title { font-size: 28px; font-weight: 700; margin: 0; }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .btn-danger:hover { background: #fecaca; }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-icon { padding: 6px; width: 32px; height: 32px; justify-content: center; }
    
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .card-body { padding: 20px; }
    
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .form-textarea { min-height: 120px; resize: vertical; }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-yellow { background: #fef9c3; color: #ca8a04; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-gray { background: #f1f5f9; color: #64748b; }
    
    .tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 12px;
      color: #475569;
      margin: 2px;
    }
    
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #64748b;
    }
    .empty-state h3 { margin: 0 0 8px; color: #475569; }
    .empty-state p { margin: 0 0 16px; font-size: 14px; }
    
    .filters {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .filter-group { display: flex; align-items: center; gap: 6px; }
    .filter-label { font-size: 13px; color: #64748b; white-space: nowrap; }
  `;
}

function systemsListPage(opts) {
  const { systems, users, currentUser, admin, filterAssigned, filterTag } = opts;
  
  const userOptions = (users || []).map(u => 
    `<option value="${u.username}" ${filterAssigned === u.username ? 'selected' : ''}>${u.username}</option>`
  ).join('');
  
  // Get all unique tags
  const allTags = new Set();
  (systems || []).forEach(s => {
    if (s.tags) {
      s.tags.split(',').forEach(t => allTags.add(t.trim()));
    }
  });
  const tagOptions = [...allTags].map(t => 
    `<option value="${t}" ${filterTag === t ? 'selected' : ''}>${t}</option>`
  ).join('');
  
  const systemCards = (systems || []).map(s => {
    const taskCount = s.tasks?.length || 0;
    const completedCount = s.tasks?.filter(t => t.is_completed).length || 0;
    const tags = s.tags ? s.tags.split(',').map(t => 
      `<span class="tag">${t.trim()}</span>`
    ).join('') : '';
    
    return `
      <a href="/systems/${s.id}" class="system-card" style="border-left: 4px solid ${s.color || '#3b82f6'};">
        <div class="system-card-header">
          <h3 class="system-card-title">${s.name}</h3>
          ${s.created_by ? `<span class="avatar" title="Created by ${s.created_by}">${s.created_by.charAt(0).toUpperCase()}</span>` : ''}
        </div>
        ${s.description ? `<p class="system-card-desc">${s.description}</p>` : ''}
        <div class="system-card-meta">
          <span class="badge badge-gray">${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
          ${taskCount > 0 ? `<span class="badge badge-green">${completedCount}/${taskCount} done</span>` : ''}
        </div>
        ${tags ? `<div class="system-card-tags">${tags}</div>` : ''}
      </a>
    `;
  }).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Systems - Daily Logger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}
      
      .systems-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }
      .system-card {
        display: block;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.15s;
        text-decoration: none;
        color: inherit;
      }
      .system-card:hover {
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        transform: translateY(-2px);
        text-decoration: none;
      }
      .system-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .system-card-title { margin: 0; font-size: 18px; flex: 1; color: #0f172a; }
      .system-card-desc { margin: 0 0 12px; font-size: 14px; color: #64748b; line-height: 1.5; }
      .system-card-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
      .system-card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
      
      .new-system-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 1000;
      }
      .new-system-modal.active { display: flex; }
      .modal-content {
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 480px;
        max-height: 90vh;
        overflow: auto;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
      }
      .modal-header h2 { margin: 0; font-size: 18px; }
      .modal-body { padding: 20px; }
      .modal-footer { padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; justify-content: flex-end; }
      
      .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
      .color-swatch {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.15s;
      }
      .color-swatch:hover { transform: scale(1.1); }
      .color-swatch.active { border-color: #0f172a; }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">My Tasks</a>
        <a href="/systems" style="color: #0f172a;">Systems</a>
        <a href="/systems/history">History</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>
    
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Systems</h1>
        <button class="btn btn-primary" onclick="openNewSystemModal()">+ New System</button>
        
        <div class="filters" style="margin-left: auto;">
          <div class="filter-group">
            <label class="filter-label">Assigned:</label>
            <select class="form-select" style="width: auto;" onchange="applyFilters()">
              <option value="">All</option>
              ${userOptions}
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Tag:</label>
            <select class="form-select" style="width: auto;" onchange="applyFilters()">
              <option value="">All</option>
              ${tagOptions}
            </select>
          </div>
        </div>
      </div>
      
      ${systems && systems.length > 0 ? `
        <div class="systems-grid">
          ${systemCards}
        </div>
      ` : `
        <div class="empty-state">
          <h3>No systems yet</h3>
          <p>Create your first system to start organizing tasks and documentation.</p>
          <button class="btn btn-primary" onclick="openNewSystemModal()">+ Create System</button>
        </div>
      `}
    </div>
    
    <!-- New System Modal -->
    <div class="new-system-modal" id="newSystemModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>New System</h2>
          <button class="btn btn-icon btn-secondary" onclick="closeNewSystemModal()">&times;</button>
        </div>
        <form id="newSystemForm" action="/systems/new" method="POST">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input type="text" name="name" class="form-input" placeholder="e.g., Q1 Goals, Product Roadmap" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea name="description" class="form-textarea" placeholder="Brief description of this system..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <input type="hidden" name="color" id="systemColor" value="#3b82f6">
              <div class="color-picker">
                <div class="color-swatch active" style="background: #3b82f6;" data-color="#3b82f6"></div>
                <div class="color-swatch" style="background: #8b5cf6;" data-color="#8b5cf6"></div>
                <div class="color-swatch" style="background: #ec4899;" data-color="#ec4899"></div>
                <div class="color-swatch" style="background: #ef4444;" data-color="#ef4444"></div>
                <div class="color-swatch" style="background: #f97316;" data-color="#f97316"></div>
                <div class="color-swatch" style="background: #eab308;" data-color="#eab308"></div>
                <div class="color-swatch" style="background: #22c55e;" data-color="#22c55e"></div>
                <div class="color-swatch" style="background: #14b8a6;" data-color="#14b8a6"></div>
                <div class="color-swatch" style="background: #64748b;" data-color="#64748b"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input type="text" name="tags" class="form-input" placeholder="e.g., marketing, urgent, q1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeNewSystemModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create System</button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      function openNewSystemModal() {
        document.getElementById('newSystemModal').classList.add('active');
      }
      function closeNewSystemModal() {
        document.getElementById('newSystemModal').classList.remove('active');
      }
      
      document.querySelectorAll('.color-swatch').forEach(function(swatch) {
        swatch.addEventListener('click', function() {
          document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
          this.classList.add('active');
          document.getElementById('systemColor').value = this.dataset.color;
        });
      });
      
      // Close modal on backdrop click
      document.getElementById('newSystemModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewSystemModal();
      });
      
      function applyFilters() {
        // Filter implementation would go here
      }
    </script>
  </body>
  </html>
  `;
}

function systemDetailPage(opts) {
  const { system, users, currentUser, admin, escapeHtml } = opts;
  const tasks = system.tasks || [];
  const attachments = system.attachments || [];
  
  const userOptions = (users || []).map(u => 
    `<option value="${u.username}">${u.username}</option>`
  ).join('');
  
  const userCheckboxes = (users || []).map(u => 
    `<label class="assignee-checkbox-label"><input type="checkbox" name="assigned_to" value="${u.username}" class="new-task-assignee"> ${u.username}</label>`
  ).join('');
  
  const tags = system.tags ? system.tags.split(',').map(t => 
    `<span class="tag">${escapeHtml(t.trim())}</span>`
  ).join('') : '';
  
  // Priority options
  const priorityOptions = `
    <option value="low">Low</option>
    <option value="medium" selected>Medium</option>
    <option value="high">High</option>
    <option value="urgent">Urgent</option>
  `;
  
  const tasksList = tasks.map(task => {
    const priorityClass = {
      low: 'badge-gray',
      medium: 'badge-blue',
      high: 'badge-yellow',
      urgent: 'badge-red'
    }[task.priority || 'medium'];
    
    const isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date();
    const taskTags = task.tags ? task.tags.split(',').map(t => 
      `<span class="tag" style="font-size: 10px;">${escapeHtml(t.trim())}</span>`
    ).join('') : '';
    
    const assignees = task.assigned_to ? task.assigned_to.split(',').map(a => a.trim()).filter(a => a) : [];
    const assigneeAvatars = assignees.map(a => 
      `<span class="avatar" title="Assigned to ${escapeHtml(a)}">${a.charAt(0).toUpperCase()}</span>`
    ).join('');
    
    return `
      <div class="task-item ${task.is_completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
        <div class="task-checkbox">
          <input type="checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
        </div>
        <div class="task-content">
          <a href="/systems/${system.id}/tasks/${task.id}" class="task-title">${escapeHtml(task.title)}</a>
          <div class="task-meta">
            <span class="badge ${priorityClass}">${task.priority || 'medium'}</span>
            ${assigneeAvatars ? `<div class="avatar-group">${assigneeAvatars}</div>` : ''}
            ${task.due_date ? `<span class="${isOverdue ? 'text-danger' : ''}" style="font-size: 12px; ${isOverdue ? 'color: #dc2626;' : ''}">Due: ${task.due_date}</span>` : ''}
            ${taskTags}
          </div>
          ${task.completed_by && task.is_completed ? `<div class="task-completed-by">Completed by ${escapeHtml(task.completed_by)}</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="btn btn-icon btn-secondary btn-sm" onclick="deleteTask(${task.id})" title="Delete">🗑</button>
        </div>
      </div>
    `;
  }).join('');
  
  const attachmentsList = attachments.map(att => `
    <div class="attachment-item" data-attachment-id="${att.id}">
      <a href="/uploads/${att.filename}" target="_blank" class="attachment-link">
        ${att.mime_type && att.mime_type.startsWith('image/') ? 
          `<img src="/uploads/${att.filename}" class="attachment-preview" alt="${escapeHtml(att.original_name)}">` :
          `<div class="attachment-icon">📎</div>`
        }
        <span class="attachment-name">${escapeHtml(att.original_name)}</span>
      </a>
      ${admin ? `<button class="btn btn-icon btn-danger btn-sm" onclick="deleteAttachment(${att.id})">🗑</button>` : ''}
    </div>
  `).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${escapeHtml(system.name)} - Systems</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}
      
      .system-header {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        border-left: 5px solid ${system.color || '#3b82f6'};
      }
      .system-title-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
      .system-title { margin: 0; font-size: 32px; flex: 1; }
      .system-title input {
        font-size: 32px;
        font-weight: 700;
        border: none;
        background: none;
        width: 100%;
        padding: 0;
      }
      .system-title input:focus { outline: none; }
      .system-description { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }
      .system-description textarea {
        width: 100%;
        border: none;
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px;
        font-size: 15px;
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
      }
      .system-description textarea:focus { outline: 2px solid #2563eb; background: white; }
      .system-tags { display: flex; flex-wrap: wrap; gap: 6px; }
      
      .content-section {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-bottom: 24px;
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
      }
      .section-title { margin: 0; font-size: 16px; flex: 1; }
      .section-body { padding: 16px 20px; }
      
      .rich-editor-wrapper {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .rich-editor-wrapper:focus-within {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      
      .formatting-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 8px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        align-items: center;
      }
      .toolbar-group {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      .toolbar-divider {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        margin: 0 8px;
      }
      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #475569;
        transition: all 0.15s;
      }
      .toolbar-btn:hover { background: #e2e8f0; color: #0f172a; }
      .toolbar-btn.active { background: #dbeafe; color: #2563eb; }
      .toolbar-btn svg { width: 18px; height: 18px; }
      .toolbar-select {
        height: 32px;
        padding: 0 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        cursor: pointer;
        min-width: 100px;
      }
      .toolbar-select:hover { border-color: #94a3b8; }
      .toolbar-color-input {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 2px solid #e2e8f0;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
      }
      .toolbar-color-input::-webkit-color-swatch { border: none; border-radius: 2px; }
      .toolbar-color-input::-webkit-color-swatch-wrapper { padding: 0; }
      
      .rich-editor {
        min-height: 300px;
        padding: 20px;
        font-size: 15px;
        line-height: 1.7;
        outline: none;
        overflow-y: auto;
      }
      .rich-editor:empty::before {
        content: 'Start writing...';
        color: #94a3b8;
        pointer-events: none;
      }
      .rich-editor h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px; }
      .rich-editor h2 { font-size: 22px; font-weight: 600; margin: 0 0 14px; }
      .rich-editor h3 { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
      .rich-editor p { margin: 0 0 12px; }
      .rich-editor ul, .rich-editor ol { margin: 0 0 12px; padding-left: 24px; }
      .rich-editor li { margin-bottom: 4px; }
      .rich-editor blockquote {
        margin: 0 0 12px;
        padding: 12px 16px;
        border-left: 4px solid #2563eb;
        background: #f1f5f9;
        border-radius: 0 8px 8px 0;
      }
      .rich-editor pre {
        margin: 0 0 12px;
        padding: 16px;
        background: #1e293b;
        color: #e2e8f0;
        border-radius: 8px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 13px;
        overflow-x: auto;
      }
      .rich-editor code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9em;
      }
      .rich-editor pre code { background: transparent; padding: 0; }
      .rich-editor a { color: #2563eb; text-decoration: underline; }
      .rich-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
      .rich-editor video { max-width: 100%; border-radius: 8px; margin: 8px 0; }
      .rich-editor table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      .rich-editor th, .rich-editor td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
      .rich-editor th { background: #f8fafc; font-weight: 600; }
      .rich-editor hr { border: none; border-top: 2px solid #e2e8f0; margin: 20px 0; }
      
      .resizable-media {
        display: inline-block;
        position: relative;
        margin: 8px 0;
        user-select: none;
      }
      .resizable-media img, .resizable-media video {
        display: block;
        border-radius: 8px;
      }
      .resizable-media:hover .resize-handle,
      .resizable-media:focus-within .resize-handle {
        opacity: 1;
      }
      .resize-handle {
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 16px;
        height: 16px;
        background: #2563eb;
        border: 2px solid white;
        border-radius: 4px;
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.15s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .resize-handle::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 6px;
        height: 6px;
        border-right: 2px solid white;
        border-bottom: 2px solid white;
      }
      
      .inline-file {
        display: inline-block;
        margin: 8px 0;
      }
      .file-download-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #1e293b;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.15s;
      }
      .file-download-link:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
        text-decoration: none;
      }
      
      .task-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
        transition: all 0.15s;
        border-radius: 8px;
        margin: 0 -8px;
        padding-left: 8px;
        padding-right: 8px;
      }
      .task-item:last-child { border-bottom: none; }
      .task-item.completed .task-title { text-decoration: line-through; color: #94a3b8; }
      .task-item.dragging { opacity: 0.5; background: #eff6ff; }
      .task-item.drag-over { border-top: 3px solid #2563eb; margin-top: -3px; }
      .drag-handle {
        cursor: grab;
        color: #94a3b8;
        padding: 4px;
        font-size: 14px;
        user-select: none;
        letter-spacing: -2px;
        transition: color 0.15s;
      }
      .drag-handle:hover { color: #475569; }
      .drag-handle:active { cursor: grabbing; }
      .task-checkbox input { width: 18px; height: 18px; cursor: pointer; margin-top: 2px; }
      .task-content { flex: 1; min-width: 0; }
      .task-title { font-size: 15px; color: #0f172a; font-weight: 500; text-decoration: none; display: block; }
      .task-title:hover { color: #2563eb; }
      .task-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
      .task-completed-by { font-size: 11px; color: #94a3b8; margin-top: 4px; }
      .task-actions { display: flex; gap: 4px; }
      
      .avatar-group { display: flex; align-items: center; }
      .avatar-group .avatar { margin-left: -6px; border: 2px solid white; }
      .avatar-group .avatar:first-child { margin-left: 0; }
      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 11px;
        font-weight: 600;
      }
      
      .multi-assignee-wrapper {
        max-height: 120px;
        overflow-y: auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px;
        background: #f8fafc;
      }
      .assignee-checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.15s;
      }
      .assignee-checkbox-label:hover { background: #e2e8f0; }
      .assignee-checkbox-label input { cursor: pointer; }
      
      .add-task-form {
        display: flex;
        gap: 12px;
        padding: 16px 0;
        border-top: 1px solid #e2e8f0;
        margin-top: 8px;
      }
      .add-task-form input { flex: 1; }
      
      .attachments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }
      .attachment-item {
        position: relative;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .attachment-link { display: block; text-decoration: none; color: inherit; }
      .attachment-preview { width: 100%; height: 100px; object-fit: cover; }
      .attachment-icon { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: #f8fafc; }
      .attachment-name { display: block; padding: 8px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .attachment-item .btn { position: absolute; top: 4px; right: 4px; }
      
      .upload-zone {
        border: 2px dashed #e2e8f0;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s;
      }
      .upload-zone:hover { border-color: #2563eb; background: #f8fafc; }
      .upload-zone.dragover { border-color: #2563eb; background: #eff6ff; }
      
      .new-task-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 1000;
      }
      .new-task-modal.active { display: flex; }
      
      /* Live collaboration styles */
      .active-users {
        position: fixed;
        top: 70px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 250px;
      }
      .active-users-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 8px;
      }
      .active-user {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        font-size: 13px;
      }
      .active-user .avatar {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }
      .active-user .editing-indicator {
        font-size: 11px;
        font-style: italic;
        margin-left: 4px;
      }
      
      /* Field editing indicator - floating badge above field */
      .field-editor-badge {
        position: absolute;
        top: -28px;
        left: 0;
        display: flex;
        gap: 6px;
        z-index: 100;
      }
      .editor-badge {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        animation: badge-appear 0.2s ease-out;
      }
      .editor-badge::before {
        content: '✎';
        font-size: 10px;
      }
      @keyframes badge-appear {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Border highlight for remote editing */
      .remote-editing-border {
        outline: 2px solid var(--editor-color, #3b82f6) !important;
        outline-offset: 2px;
      }
      
      .live-update-flash {
        animation: flash-update 0.5s ease-out;
      }
      @keyframes flash-update {
        0% { background-color: rgba(59, 130, 246, 0.2); }
        100% { background-color: transparent; }
      }
      
      .system-title, .system-description, .rich-editor-wrapper {
        position: relative;
        margin-top: 32px;
      }
      .rich-editor {
        position: relative;
      }
      
      /* Content Checklist Styles */
      .content-checklist {
        margin: 12px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        overflow: hidden;
      }
      .content-checklist-header {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        background: #fff;
        cursor: pointer;
        gap: 10px;
        border-bottom: 1px solid transparent;
        transition: background 0.15s;
      }
      .content-checklist-header:hover {
        background: #f1f5f9;
      }
      .content-checklist.expanded .content-checklist-header {
        border-bottom-color: #e2e8f0;
      }
      .content-checklist-toggle {
        font-size: 12px;
        color: #64748b;
        transition: transform 0.2s;
        user-select: none;
      }
      .content-checklist.expanded .content-checklist-toggle {
        transform: rotate(90deg);
      }
      .content-checklist-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #22c55e;
      }
      .content-checklist-title {
        flex: 1;
        font-weight: 500;
        color: #1e293b;
        outline: none;
        min-width: 50px;
      }
      .content-checklist-title:empty::before {
        content: 'Checklist item...';
        color: #94a3b8;
      }
      .content-checklist.checked .content-checklist-title {
        text-decoration: line-through;
        color: #64748b;
      }
      .content-checklist-delete {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.15s, color 0.15s;
      }
      .content-checklist-header:hover .content-checklist-delete {
        opacity: 1;
      }
      .content-checklist-delete:hover {
        color: #ef4444;
      }
      .content-checklist-body {
        display: none;
        padding: 12px;
        background: #fff;
        min-height: 60px;
      }
      .content-checklist.expanded .content-checklist-body {
        display: block;
      }
      .content-checklist-body:empty::before {
        content: 'Add details, images, or videos here...';
        color: #94a3b8;
        font-style: italic;
      }
      .content-checklist-body img,
      .content-checklist-body video {
        max-width: 100%;
        border-radius: 6px;
        margin: 8px 0;
      }
    </style>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">My Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/systems/history">History</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>
    
    <!-- Active Users Panel -->
    <div class="active-users" id="activeUsersPanel" style="display: none;">
      <div class="active-users-title">👥 Viewing this system</div>
      <div id="activeUsersList"></div>
    </div>
    
    <div class="container">
      <div style="margin-bottom: 16px;">
        <a href="/systems" class="btn btn-secondary btn-sm">← Back to Systems</a>
      </div>
      
      <!-- System Header -->
      <div class="system-header">
        <div class="system-title-row">
          <h1 class="system-title">
            <input type="text" id="systemName" value="${escapeHtml(system.name)}" onblur="updateSystem()">
          </h1>
          ${admin ? `<button class="btn btn-danger" onclick="deleteSystem()">Delete System</button>` : ''}
        </div>
        <div class="system-description">
          <textarea id="systemDescription" placeholder="Add a description..." onblur="updateSystem()">${escapeHtml(system.description || '')}</textarea>
        </div>
        ${tags ? `<div class="system-tags">${tags}</div>` : ''}
      </div>
      
      <!-- Content Section (like Google Docs) -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📝 Content</h2>
        </div>
        <div class="section-body">
          <div class="rich-editor-wrapper">
            <div class="formatting-toolbar">
              <div class="toolbar-group">
                <select class="toolbar-select" onchange="formatBlock(this.value); this.value='';" title="Text Style">
                  <option value="">Style</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="p">Paragraph</option>
                  <option value="pre">Code Block</option>
                  <option value="blockquote">Quote</option>
                </select>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('bold')" title="Bold (Ctrl+B)"><b>B</b></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('italic')" title="Italic (Ctrl+I)"><i>I</i></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('underline')" title="Underline (Ctrl+U)"><u>U</u></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><s>S</s></button>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <input type="color" class="toolbar-color-input" value="#000000" onchange="execCmd('foreColor', this.value)" title="Text Color">
                <input type="color" class="toolbar-color-input" value="#ffffff" onchange="execCmd('backColor', this.value)" title="Highlight">
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('justifyLeft')" title="Align Left">⬅</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('justifyCenter')" title="Align Center">≡</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('justifyRight')" title="Align Right">➡</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('justifyFull')" title="Justify">☰</button>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('insertUnorderedList')" title="Bullet List">•≡</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('insertOrderedList')" title="Numbered List">1.</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('outdent')" title="Decrease Indent">←</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('indent')" title="Increase Indent">→</button>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="insertLink()" title="Insert Link">🔗</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('image')" title="Upload Image">🖼️</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('video')" title="Upload Video">🎬</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('file')" title="Upload File">📎</button>
                <button type="button" class="toolbar-btn" onclick="insertTable()" title="Insert Table">📊</button>
                <button type="button" class="toolbar-btn" onclick="insertContentChecklist()" title="Insert Checklist">☑️</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('insertHorizontalRule')" title="Horizontal Line">—</button>
                <input type="file" id="inlineFileInput" style="display:none" onchange="handleFileUpload(this)" accept="*/*">
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('removeFormat')" title="Clear Formatting">✖</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('undo')" title="Undo (Ctrl+Z)">↩</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('redo')" title="Redo (Ctrl+Y)">↪</button>
              </div>
            </div>
            <div class="rich-editor" contenteditable="true" id="systemContent" onblur="updateSystem()" oninput="autoSave()">${system.content || ''}</div>
          </div>
        </div>
      </div>
      
      <!-- Tasks Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">✅ Tasks (${tasks.length})</h2>
          <button class="btn btn-primary btn-sm" onclick="openNewTaskModal()">+ Add Task</button>
        </div>
        <div class="section-body">
          ${tasks.length > 0 ? `
            <div class="tasks-list">
              ${tasksList}
            </div>
          ` : `
            <div class="empty-state" style="padding: 24px;">
              <p>No tasks yet. Add your first task to start tracking work.</p>
            </div>
          `}
        </div>
      </div>
      
      <!-- Attachments Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📎 Attachments (${attachments.length})</h2>
        </div>
        <div class="section-body">
          ${attachments.length > 0 ? `
            <div class="attachments-grid" style="margin-bottom: 16px;">
              ${attachmentsList}
            </div>
          ` : ''}
          <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
            <input type="file" id="fileInput" multiple style="display: none;" onchange="uploadFiles(this.files)">
            <p style="margin: 0; color: #64748b;">Drop files here or click to upload</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Images, videos, documents</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- New Task Modal -->
    <div class="new-task-modal" id="newTaskModal">
      <div class="modal-content" style="background: white; border-radius: 16px; width: 100%; max-width: 520px;">
        <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="margin: 0; font-size: 18px;">New Task</h2>
          <button class="btn btn-icon btn-secondary" onclick="closeNewTaskModal()">&times;</button>
        </div>
        <form id="newTaskForm" method="POST" action="/systems/${system.id}/tasks/new">
          <div style="padding: 20px;">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input type="text" name="title" class="form-input" placeholder="What needs to be done?" required>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea name="description" class="form-textarea" placeholder="Add more details..."></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Assigned To</label>
                <div class="multi-assignee-wrapper">
                  ${userCheckboxes}
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select name="priority" class="form-select">
                  ${priorityOptions}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" name="due_date" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input type="text" name="tags" class="form-input" placeholder="e.g., bug, feature, docs">
            </div>
          </div>
          <div style="padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeNewTaskModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      var systemId = ${system.id};
      
      // Client-side escapeHtml function
      function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }
      
      function openNewTaskModal() {
        document.getElementById('newTaskModal').classList.add('active');
      }
      function closeNewTaskModal() {
        document.getElementById('newTaskModal').classList.remove('active');
      }
      document.getElementById('newTaskModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewTaskModal();
      });
      
      // Intercept form submission for live sync
      document.getElementById('newTaskForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        
        // Get selected assignees (checkboxes)
        var assignees = [];
        form.querySelectorAll('input[name="assigned_to"]:checked').forEach(function(cb) {
          assignees.push(cb.value);
        });
        
        var taskData = {
          title: formData.get('title'),
          description: formData.get('description'),
          priority: formData.get('priority'),
          due_date: formData.get('due_date'),
          tags: formData.get('tags'),
          assigned_to: assignees.join(',')
        };
        
        try {
          var response = await fetch('/api/systems/' + systemId + '/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
          });
          
          if (response.ok) {
            var task = await response.json();
            
            // Add to our own DOM
            addTaskToDOM(task);
            
            // Emit socket event for other clients
            socket.emit('task-created', { room: room, task: task, username: currentUsername });
            
            // Close modal and reset form
            closeNewTaskModal();
            form.reset();
          } else {
            alert('Failed to create task');
          }
        } catch (err) {
          console.error('Error creating task:', err);
          alert('Error creating task');
        }
      });
      
      // Rich Text Editor Functions
      function execCmd(command, value) {
        document.execCommand(command, false, value || null);
        document.getElementById('systemContent').focus();
      }
      
      function formatBlock(tag) {
        if (tag) {
          document.execCommand('formatBlock', false, '<' + tag + '>');
          document.getElementById('systemContent').focus();
        }
      }
      
      function insertLink() {
        var url = prompt('Enter URL:', 'https://');
        if (url) {
          var selection = window.getSelection();
          var text = selection.toString() || url;
          document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank">' + text + '</a>');
        }
      }
      
      var currentUploadType = 'file';
      function triggerFileUpload(type) {
        currentUploadType = type;
        var input = document.getElementById('inlineFileInput');
        if (type === 'image') {
          input.accept = 'image/*';
        } else if (type === 'video') {
          input.accept = 'video/*';
        } else {
          input.accept = '*/*';
        }
        input.click();
      }
      
      async function handleFileUpload(input) {
        if (!input.files || !input.files.length) return;
        var file = input.files[0];
        await uploadAndInsertMedia(file);
        input.value = '';
      }
      
      function insertImage() {
        triggerFileUpload('image');
      }

      function insertTable() {
        var rows = prompt('Number of rows:', '3') || '3';
        var cols = prompt('Number of columns:', '3') || '3';
        var tableHtml = '<table><tbody>';
        for (var i = 0; i < parseInt(rows); i++) {
          tableHtml += '<tr>';
          for (var j = 0; j < parseInt(cols); j++) {
            if (i === 0) {
              tableHtml += '<th>Header</th>';
            } else {
              tableHtml += '<td>Cell</td>';
            }
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        document.execCommand('insertHTML', false, tableHtml);
      }
      
      // Insert content checklist
      function insertContentChecklist() {
        var id = 'cl-' + Date.now();
        var html = '<div class="content-checklist" data-checklist-id="' + id + '" contenteditable="false">' +
          '<div class="content-checklist-header" onclick="toggleContentChecklist(this.parentElement)">' +
            '<span class="content-checklist-toggle">▶</span>' +
            '<input type="checkbox" class="content-checklist-checkbox" onclick="event.stopPropagation(); toggleChecklistChecked(this)">' +
            '<span class="content-checklist-title" contenteditable="true" onclick="event.stopPropagation()" onblur="triggerContentUpdate()"></span>' +
            '<button class="content-checklist-delete" onclick="event.stopPropagation(); deleteContentChecklist(this)" title="Delete">&times;</button>' +
          '</div>' +
          '<div class="content-checklist-body" contenteditable="true" onblur="triggerContentUpdate()"></div>' +
        '</div><p></p>';
        document.execCommand('insertHTML', false, html);
        // Focus the title
        setTimeout(function() {
          var checklist = document.querySelector('[data-checklist-id="' + id + '"]');
          if (checklist) {
            var title = checklist.querySelector('.content-checklist-title');
            if (title) title.focus();
          }
        }, 10);
      }
      
      function toggleContentChecklist(el) {
        el.classList.toggle('expanded');
        triggerContentUpdate();
      }
      
      function toggleChecklistChecked(checkbox) {
        var checklist = checkbox.closest('.content-checklist');
        if (checklist) {
          checklist.classList.toggle('checked', checkbox.checked);
          // Set the checked attribute so it persists in innerHTML
          if (checkbox.checked) {
            checkbox.setAttribute('checked', 'checked');
          } else {
            checkbox.removeAttribute('checked');
          }
          triggerContentUpdate();
        }
      }
      
      function deleteContentChecklist(btn) {
        var checklist = btn.closest('.content-checklist');
        if (checklist && confirm('Delete this checklist item?')) {
          checklist.remove();
          triggerContentUpdate();
        }
      }
      
      function triggerContentUpdate() {
        // Debounced content update
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
          updateSystem();
          // Also emit socket event
          var content = document.getElementById('systemContent');
          if (content && typeof socket !== 'undefined') {
            socket.emit('content-update', { room: room, field: 'systemContent', value: content.innerHTML, username: currentUsername });
          }
        }, 500);
      }
      
      // Auto-save with debounce
      var autoSaveTimer;
      function autoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
          updateSystem();
        }, 1000);
      }
      
      // Keyboard shortcuts
      document.getElementById('systemContent').addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 's':
              e.preventDefault();
              updateSystem();
              break;
          }
        }
      });
      
      // Paste image/video/file handler
      document.getElementById('systemContent').addEventListener('paste', function(e) {
        var clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData || !clipboardData.items) return;
        
        var items = clipboardData.items;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.kind === 'file') {
            e.preventDefault();
            var file = item.getAsFile();
            if (file) {
              uploadAndInsertMedia(file);
            }
            return;
          }
        }
      });
      
      // Also handle drop events
      document.getElementById('systemContent').addEventListener('drop', function(e) {
        e.preventDefault();
        var files = e.dataTransfer.files;
        if (files && files.length > 0) {
          uploadAndInsertMedia(files[0]);
        }
      });
      
      document.getElementById('systemContent').addEventListener('dragover', function(e) {
        e.preventDefault();
      });
      
      function uploadAndInsertMedia(file) {
        if (!file) return;
        
        // Show uploading indicator with progress bar
        var tempId = 'uploading-' + Date.now();
        var uploadingHtml = '<div id="' + tempId + '" style="display: inline-block; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 4px 0; min-width: 200px;">' +
          '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
            '<span style="color: #64748b;">⏳</span>' +
            '<span style="color: #475569; font-size: 13px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + file.name + '</span>' +
            '<span class="upload-percent" style="color: #3b82f6; font-weight: 600; font-size: 12px;">0%</span>' +
          '</div>' +
          '<div style="background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden;">' +
            '<div class="upload-progress-bar" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: 0%; transition: width 0.2s;"></div>' +
          '</div>' +
        '</div>';
        document.execCommand('insertHTML', false, uploadingHtml);
        
        var formData = new FormData();
        formData.append('files', file);
        
        var xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            var percent = Math.round((e.loaded / e.total) * 100);
            var uploadingEl = document.getElementById(tempId);
            if (uploadingEl) {
              var progressBar = uploadingEl.querySelector('.upload-progress-bar');
              var percentText = uploadingEl.querySelector('.upload-percent');
              if (progressBar) progressBar.style.width = percent + '%';
              if (percentText) percentText.textContent = percent + '%';
            }
          }
        });
        
        xhr.addEventListener('load', function() {
          var uploadingEl = document.getElementById(tempId);
          if (uploadingEl) uploadingEl.remove();
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var attachments = JSON.parse(xhr.responseText);
              
              if (attachments && attachments.length > 0) {
                var att = attachments[0];
                var url = '/uploads/' + att.filename;
                var mimeType = att.mime_type || '';
                var html;
                
                if (mimeType.startsWith('image/')) {
                  html = '<div class="resizable-media" contenteditable="false"><img src="' + url + '" style="max-width: 100%; width: 400px;"><div class="resize-handle"></div></div>';
                } else if (mimeType.startsWith('video/')) {
                  html = '<div class="resizable-media" contenteditable="false"><video src="' + url + '" controls style="max-width: 100%; width: 400px;"></video><div class="resize-handle"></div></div>';
                } else {
                  // For other files, show a download link
                  var icon = '📄';
                  if (mimeType.startsWith('audio/')) icon = '🎵';
                  else if (mimeType.includes('pdf')) icon = '📕';
                  else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) icon = '📦';
                  else if (mimeType.includes('word') || mimeType.includes('document')) icon = '📝';
                  else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) icon = '📊';
                  
                  html = '<div class="inline-file" contenteditable="false"><a href="' + url + '" download="' + (att.original_name || att.filename) + '" class="file-download-link">' + icon + ' ' + (att.original_name || att.filename) + '</a></div>';
                }
                
                // Insert at cursor position
                var selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  var range = selection.getRangeAt(0);
                  var div = document.createElement('div');
                  div.innerHTML = html + '<p><br></p>';
                  var frag = document.createDocumentFragment();
                  while (div.firstChild) {
                    frag.appendChild(div.firstChild);
                  }
                  range.insertNode(frag);
                  range.collapse(false);
                } else {
                  document.execCommand('insertHTML', false, html + '<p></p>');
                }
                
                initResizeHandles();
                autoSave();
              }
            } catch (e) {
              console.error('Error parsing upload response:', e);
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            document.execCommand('insertHTML', false, '<span style="color: #ef4444;">❌ Upload failed</span>');
          }
        });
        
        xhr.addEventListener('error', function() {
          console.error('Error uploading media');
          var uploadingEl = document.getElementById(tempId);
          if (uploadingEl) {
            uploadingEl.innerHTML = '<span style="color: #ef4444;">❌ Upload failed</span>';
          }
        });
        
        xhr.open('POST', '/api/systems/' + systemId + '/attachments');
        xhr.send(formData);
      }
      
      // Resizable media functionality
      function initResizeHandles() {
        document.querySelectorAll('.resizable-media').forEach(function(wrapper) {
          var handle = wrapper.querySelector('.resize-handle');
          var media = wrapper.querySelector('img, video');
          if (!handle || !media) return;
          
          handle.onmousedown = function(e) {
            e.preventDefault();
            var startX = e.clientX;
            var startWidth = media.offsetWidth;
            
            function onMouseMove(e) {
              var newWidth = startWidth + (e.clientX - startX);
              if (newWidth > 50 && newWidth < 1200) {
                media.style.width = newWidth + 'px';
              }
            }
            
            function onMouseUp() {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              autoSave();
              // Emit content update for live sync
              if (socket) {
                var content = document.getElementById('systemContent');
                if (content) {
                  socket.emit('content-update', { room: room, field: 'systemContent', value: content.innerHTML, username: currentUsername });
                }
              }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          };
        });
      }
      
      // Initialize on load
      initResizeHandles();
      
      async function updateSystem() {
        var name = document.getElementById('systemName').value;
        var description = document.getElementById('systemDescription').value;
        var content = document.getElementById('systemContent').innerHTML;
        
        try {
          await fetch('/api/systems/' + systemId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, description: description, content: content })
          });
        } catch (e) {
          console.error('Error updating system:', e);
        }
      }
      
      async function toggleTask(taskId, completed) {
        try {
          await fetch('/api/tasks/' + taskId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: completed })
          });
          // Emit socket event for other clients
          socket.emit('task-toggle', { room: room, taskId: taskId, completed: completed, username: currentUsername });
          // Update our own DOM
          var taskItem = document.querySelector('[data-task-id="' + taskId + '"]');
          if (taskItem) {
            taskItem.classList.toggle('completed', completed);
          }
        } catch (e) {
          console.error('Error toggling task:', e);
        }
      }
      
      async function deleteTask(taskId) {
        if (!confirm('Delete this task?')) return;
        try {
          await fetch('/api/tasks/' + taskId, { method: 'DELETE' });
          // Emit socket event for other clients
          socket.emit('task-deleted', { room: room, taskId: taskId, username: currentUsername });
          // Remove from DOM
          var taskItem = document.querySelector('[data-task-id="' + taskId + '"]');
          if (taskItem) {
            taskItem.style.opacity = '0.5';
            taskItem.style.textDecoration = 'line-through';
            setTimeout(function() { taskItem.remove(); }, 300);
          }
        } catch (e) {
          console.error('Error deleting task:', e);
        }
      }
      
      // Helper function to escape HTML
      function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
      
      // Add task to DOM dynamically
      function addTaskToDOM(task) {
        var tasksList = document.querySelector('.tasks-list');
        if (!tasksList) return;
        
        // Check if task already exists
        if (document.querySelector('[data-task-id="' + task.id + '"]')) return;
        
        var priorityClasses = {
          low: 'badge-gray',
          medium: 'badge-blue',
          high: 'badge-yellow',
          urgent: 'badge-red'
        };
        var priorityClass = priorityClasses[task.priority || 'medium'];
        
        var isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date();
        
        var taskTags = '';
        if (task.tags) {
          task.tags.split(',').forEach(function(t) {
            taskTags += '<span class="tag" style="font-size: 10px;">' + escapeHtml(t.trim()) + '</span>';
          });
        }
        
        var assigneeAvatars = '';
        if (task.assigned_to) {
          task.assigned_to.split(',').forEach(function(a) {
            var name = a.trim();
            if (name) {
              assigneeAvatars += '<span class="avatar" title="Assigned to ' + escapeHtml(name) + '">' + name.charAt(0).toUpperCase() + '</span>';
            }
          });
        }
        
        var html = '<div class="task-item" data-task-id="' + task.id + '" draggable="true">' +
          '<div class="drag-handle" title="Drag to reorder">⋮⋮</div>' +
          '<div class="task-checkbox">' +
            '<input type="checkbox" onchange="toggleTask(' + task.id + ', this.checked)">' +
          '</div>' +
          '<div class="task-content">' +
            '<a href="/systems/' + systemId + '/tasks/' + task.id + '" class="task-title">' + escapeHtml(task.title) + '</a>' +
            '<div class="task-meta">' +
              '<span class="badge ' + priorityClass + '">' + (task.priority || 'medium') + '</span>' +
              (assigneeAvatars ? '<div class="avatar-group">' + assigneeAvatars + '</div>' : '') +
              (task.due_date ? '<span class="' + (isOverdue ? 'text-danger' : '') + '" style="font-size: 12px;' + (isOverdue ? ' color: #dc2626;' : '') + '">Due: ' + task.due_date + '</span>' : '') +
              taskTags +
            '</div>' +
          '</div>' +
          '<div class="task-actions">' +
            '<button class="btn btn-icon btn-secondary btn-sm" onclick="deleteTask(' + task.id + ')" title="Delete">🗑</button>' +
          '</div>' +
        '</div>';
        
        // Add to bottom of list
        tasksList.insertAdjacentHTML('beforeend', html);
        
        // Flash animation
        var newItem = document.querySelector('[data-task-id="' + task.id + '"]');
        if (newItem) flashElement(newItem);
      }
      
      // Drag and drop reordering for tasks
      (function() {
        var draggedItem = null;
        var tasksList = document.querySelector('.tasks-list');
        if (!tasksList) return;
        
        tasksList.addEventListener('dragstart', function(e) {
          var taskItem = e.target.closest('.task-item');
          if (!taskItem) return;
          draggedItem = taskItem;
          taskItem.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', taskItem.dataset.taskId);
        });
        
        tasksList.addEventListener('dragend', function(e) {
          var taskItem = e.target.closest('.task-item');
          if (taskItem) taskItem.classList.remove('dragging');
          document.querySelectorAll('.task-item.drag-over').forEach(function(el) {
            el.classList.remove('drag-over');
          });
          draggedItem = null;
        });
        
        tasksList.addEventListener('dragover', function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          
          var taskItem = e.target.closest('.task-item');
          if (!taskItem || taskItem === draggedItem) return;
          
          // Remove drag-over from all items
          document.querySelectorAll('.task-item.drag-over').forEach(function(el) {
            el.classList.remove('drag-over');
          });
          
          taskItem.classList.add('drag-over');
        });
        
        tasksList.addEventListener('dragleave', function(e) {
          var taskItem = e.target.closest('.task-item');
          if (taskItem) taskItem.classList.remove('drag-over');
        });
        
        tasksList.addEventListener('drop', function(e) {
          e.preventDefault();
          
          var dropTarget = e.target.closest('.task-item');
          if (!dropTarget || !draggedItem || dropTarget === draggedItem) return;
          
          // Insert the dragged item before the drop target
          var items = Array.from(tasksList.querySelectorAll('.task-item'));
          var draggedIndex = items.indexOf(draggedItem);
          var dropIndex = items.indexOf(dropTarget);
          
          if (draggedIndex < dropIndex) {
            dropTarget.parentNode.insertBefore(draggedItem, dropTarget.nextSibling);
          } else {
            dropTarget.parentNode.insertBefore(draggedItem, dropTarget);
          }
          
          dropTarget.classList.remove('drag-over');
          
          // Save new order to server
          saveTaskOrder();
        });
        
        async function saveTaskOrder() {
          var taskIds = Array.from(tasksList.querySelectorAll('.task-item')).map(function(item) {
            return parseInt(item.dataset.taskId);
          });
          
          console.log('Saving task order:', taskIds);
          
          try {
            await fetch('/api/systems/' + systemId + '/tasks/reorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskIds: taskIds })
            });
            console.log('Dispatching tasksReordered event');
            // Dispatch custom event for socket emit (socket defined later)
            window.dispatchEvent(new CustomEvent('tasksReordered', { detail: { taskIds: taskIds } }));
          } catch (e) {
            console.error('Error saving task order:', e);
          }
        }
      })();
      
      async function deleteSystem() {
        if (!confirm('Delete this system and all its tasks?')) return;
        try {
          await fetch('/api/systems/' + systemId, { method: 'DELETE' });
          window.location.href = '/systems';
        } catch (e) {
          console.error('Error deleting system:', e);
        }
      }
      
      async function deleteAttachment(attId) {
        if (!confirm('Delete this attachment?')) return;
        try {
          await fetch('/api/attachments/' + attId, { method: 'DELETE' });
          // Emit socket event
          if (socket) {
            socket.emit('attachment-delete', { room: room, attachmentId: attId, username: currentUsername });
          }
          // Remove from DOM
          var item = document.querySelector('[data-attachment-id="' + attId + '"]');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() {
              item.remove();
              // Update count
              var countHeader = document.querySelector('.section-title');
              if (countHeader && countHeader.textContent.includes('Attachments')) {
                var count = document.querySelectorAll('.attachment-item').length;
                countHeader.textContent = '\ud83d\udcce Attachments (' + count + ')';
              }
            }, 300);
          }
        } catch (e) {
          console.error('Error deleting attachment:', e);
        }
      }
      
      // File upload
      var uploadZone = document.getElementById('uploadZone');
      uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
      });
      uploadZone.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
      });
      uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        uploadFiles(e.dataTransfer.files);
      });
      
      async function uploadFiles(files) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
        try {
          await fetch('/api/systems/' + systemId + '/attachments', {
            method: 'POST',
            body: formData
          });
          location.reload();
        } catch (e) {
          console.error('Error uploading files:', e);
        }
      }
      
      // ============ LIVE COLLABORATION ============
      var socket = io();
      var room = 'system:' + systemId;
      var currentUsername = '${currentUser || "Anonymous"}';
      var mySocketId = null;
      var updateDebounceTimers = {};
      var activeEditors = {}; // Track who's editing what field
      var isSendingUpdate = false;
      
      socket.on('connect', function() {
        console.log('Connected to live updates');
        mySocketId = socket.id;
        socket.emit('join', { room: room, username: currentUsername });
      });
      
      // Listen for task reorder events from the drag/drop IIFE
      window.addEventListener('tasksReordered', function(e) {
        console.log('Emitting tasks-reordered:', e.detail.taskIds);
        socket.emit('tasks-reordered', { room: room, taskIds: e.detail.taskIds, username: currentUsername });
      });
      
      function flashElement(el) {
        if (!el) return;
        el.classList.add('live-update-flash');
        setTimeout(function() { el.classList.remove('live-update-flash'); }, 500);
      }
      
      function applyRemoteUpdate(field, value) {
        var isActive = document.activeElement === field;
        var cursorPos = 0;
        var scrollTop = field.scrollTop;
        
        // Save cursor position if we're actively editing
        if (isActive) {
          if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            cursorPos = field.selectionStart || 0;
          } else if (field.contentEditable === 'true') {
            var sel = window.getSelection();
            if (sel.rangeCount > 0) {
              var range = sel.getRangeAt(0);
              cursorPos = range.startOffset;
            }
          }
        }
        
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
          if (field.value !== value) {
            field.value = value;
            if (!isActive) flashElement(field);
            // Restore cursor
            if (isActive) {
              var newPos = Math.min(cursorPos, value.length);
              field.setSelectionRange(newPos, newPos);
            }
          }
        } else if (field.contentEditable === 'true') {
          if (field.innerHTML !== value) {
            field.innerHTML = value;
            if (!isActive) flashElement(field);
            // Restore cursor position in contenteditable
            if (isActive && field.childNodes.length > 0) {
              try {
                var sel = window.getSelection();
                var range = document.createRange();
                var textNode = field.childNodes[0];
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                  var newPos = Math.min(cursorPos, textNode.length);
                  range.setStart(textNode, newPos);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              } catch(e) { /* cursor restore failed, that's ok */ }
            }
          }
        }
        
        // Restore scroll position
        field.scrollTop = scrollTop;
      }
      
      // Active users updated
      socket.on('users-updated', function(data) {
        var panel = document.getElementById('activeUsersPanel');
        var list = document.getElementById('activeUsersList');
        var users = (data.users || []).filter(function(u) { return u.socketId !== mySocketId; });
        
        if (users.length > 0) {
          panel.style.display = 'block';
          list.innerHTML = users.map(function(u) {
            var color = u.color || '#3b82f6';
            var editingField = u.editing || '';
            var editingText = editingField ? '<span class="editing-indicator" style="color:' + color + '"> — editing</span>' : '';
            return '<div class="active-user"><span class="avatar" style="background:' + color + '">' + u.username.charAt(0).toUpperCase() + '</span> ' + u.username + editingText + '</div>';
          }).join('');
        } else {
          panel.style.display = 'none';
        }
      });
      
      // Someone started editing a field
      socket.on('user-editing', function(data) {
        if (data.socketId === mySocketId) return;
        activeEditors[data.field] = activeEditors[data.field] || {};
        activeEditors[data.field][data.socketId] = { username: data.username, color: data.color, socketId: data.socketId };
        updateFieldIndicators(data.field);
      });
      
      // Someone stopped editing
      socket.on('user-stopped-editing', function(data) {
        if (data.socketId === mySocketId) return;
        if (activeEditors[data.field]) {
          delete activeEditors[data.field][data.socketId];
        }
        updateFieldIndicators(data.field);
      });
      
      // Update field indicators (badges and border)
      function updateFieldIndicators(fieldId) {
        var field = document.getElementById(fieldId);
        if (!field) return;
        
        var wrapper = field.closest('.rich-editor-wrapper, .system-title, .system-description');
        if (!wrapper) wrapper = field.parentElement;
        wrapper.style.position = 'relative';
        
        var editors = activeEditors[fieldId] || {};
        var editorList = Object.values(editors);
        
        var badgeContainer = wrapper.querySelector('.field-editor-badge');
        
        if (editorList.length === 0) {
          if (badgeContainer) badgeContainer.remove();
          field.classList.remove('remote-editing-border');
          field.style.removeProperty('--editor-color');
          return;
        }
        
        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'field-editor-badge';
          wrapper.appendChild(badgeContainer);
        }
        
        badgeContainer.innerHTML = editorList.map(function(e) {
          return '<span class="editor-badge" style="background:' + (e.color || '#3b82f6') + '">' + e.username + '</span>';
        }).join('');
        
        var firstEditor = editorList[0];
        field.classList.add('remote-editing-border');
        field.style.setProperty('--editor-color', firstEditor.color || '#3b82f6');
      }
      
      // Task toggled by another user
      socket.on('task-toggled', function(data) {
        var taskItem = document.querySelector('[data-task-id="' + data.taskId + '"]');
        if (taskItem) {
          var checkbox = taskItem.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = data.completed;
          taskItem.classList.toggle('completed', data.completed);
          flashElement(taskItem);
        }
      });
      
      // Task added by another user
      socket.on('task-added', function(data) {
        addTaskToDOM(data.task);
      });
      
      // Task removed by another user
      socket.on('task-removed', function(data) {
        var taskItem = document.querySelector('[data-task-id="' + data.taskId + '"]');
        if (taskItem) {
          taskItem.style.opacity = '0.5';
          taskItem.style.textDecoration = 'line-through';
          setTimeout(function() { taskItem.remove(); }, 300);
        }
      });
      
      // Tasks reordered by another user
      socket.on('tasks-order-changed', function(data) {
        console.log('Received tasks-order-changed:', data);
        var tasksList = document.querySelector('.tasks-list');
        if (tasksList && data.taskIds) {
          data.taskIds.forEach(function(id) {
            var item = tasksList.querySelector('[data-task-id="' + id + '"]');
            if (item) tasksList.appendChild(item);
          });
          flashElement(tasksList);
        }
      });
      
      // Content changed by another user
      socket.on('content-changed', function(data) {
        if (data.fromSocketId === mySocketId) return;
        
        var field = document.getElementById(data.field);
        if (!field) return;
        
        // Don't accept null/undefined updates
        if (data.value === null || data.value === undefined) return;
        
        // Always apply remote updates immediately to keep clients in sync
        applyRemoteUpdate(field, data.value);
      });
      
      // Setup editing tracking for system fields
      function setupSystemEditingTracking() {
        var fields = ['systemName', 'systemDescription', 'systemContent'];
        
        fields.forEach(function(fieldId) {
          var field = document.getElementById(fieldId);
          if (!field) return;
          
          field.addEventListener('focus', function() {
            socket.emit('editing-start', { room: room, field: fieldId, username: currentUsername });
          });
          
          field.addEventListener('blur', function() {
            socket.emit('editing-stop', { room: room, field: fieldId, username: currentUsername });
          });
          
          field.addEventListener('input', function() {
            if (isSendingUpdate) return;
            
            clearTimeout(updateDebounceTimers[fieldId]);
            updateDebounceTimers[fieldId] = setTimeout(function() {
              var value;
              if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                value = field.value;
              } else {
                value = field.innerHTML;
              }
              
              isSendingUpdate = true;
              socket.emit('content-update', { room: room, field: fieldId, value: value, username: currentUsername });
              isSendingUpdate = false;
            }, 100); // Fast debounce
          });
        });
      }
      
      setupSystemEditingTracking();
      
      socket.on('disconnect', function() {
        console.log('Disconnected from live updates');
      });
    </script>
  </body>
  </html>
  `;
}

function taskDetailPage(opts) {
  const { system, task, checklist, attachments, users, currentUser, admin, escapeHtml } = opts;
  
  // Parse comma-separated assignees
  const assignedUsers = task.assigned_to ? task.assigned_to.split(',').map(a => a.trim()).filter(a => a) : [];
  
  const userOptions = (users || []).map(u => 
    `<option value="${u.username}" ${assignedUsers.includes(u.username) ? 'selected' : ''}>${u.username}</option>`
  ).join('');
  
  const userCheckboxes = (users || []).map(u => 
    `<label class="assignee-checkbox-label"><input type="checkbox" value="${u.username}" class="assignee-checkbox" ${assignedUsers.includes(u.username) ? 'checked' : ''} onchange="updateTask()"> ${u.username}</label>`
  ).join('');
  
  const priorityOptions = ['low', 'medium', 'high', 'urgent'].map(p => 
    `<option value="${p}" ${task.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
  ).join('');
  
  const tags = task.tags ? task.tags.split(',').map(t => 
    `<span class="tag">${escapeHtml(t.trim())}</span>`
  ).join('') : '';
  
  const assigneeAvatars = assignedUsers.map(a => 
    `<span class="avatar" title="${escapeHtml(a)}">${a.charAt(0).toUpperCase()}</span>`
  ).join('');
  
  const checklistItems = (checklist || []).map(item => `
    <div class="checklist-item" data-item-id="${item.id}">
      <input type="checkbox" ${item.is_completed ? 'checked' : ''} onchange="toggleChecklistItem(${item.id}, this.checked)">
      <span class="checklist-title ${item.is_completed ? 'completed' : ''}">${escapeHtml(item.title)}</span>
      ${item.completed_by ? `<span class="checklist-completed-by">by ${escapeHtml(item.completed_by)}</span>` : ''}
      <button class="btn btn-icon btn-sm" onclick="deleteChecklistItem(${item.id})" style="opacity: 0.5;">&times;</button>
    </div>
  `).join('');
  
  const attachmentsList = (attachments || []).map(att => `
    <div class="attachment-item" data-attachment-id="${att.id}">
      <a href="/uploads/${att.filename}" target="_blank" class="attachment-link">
        ${att.mime_type && att.mime_type.startsWith('image/') ? 
          `<img src="/uploads/${att.filename}" class="attachment-preview" alt="${escapeHtml(att.original_name)}">` :
          att.mime_type && att.mime_type.startsWith('video/') ?
          `<video src="/uploads/${att.filename}" class="attachment-preview"></video>` :
          `<div class="attachment-icon">📎</div>`
        }
        <span class="attachment-name">${escapeHtml(att.original_name)}</span>
      </a>
      <button class="btn btn-icon btn-danger btn-sm" onclick="deleteAttachment(${att.id})">🗑</button>
    </div>
  `).join('');
  
  const priorityClass = {
    low: 'badge-gray',
    medium: 'badge-blue',
    high: 'badge-yellow',
    urgent: 'badge-red'
  }[task.priority || 'medium'];
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${escapeHtml(task.title)} - ${escapeHtml(system.name)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}
      
      .task-header {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
      }
      .task-title-row { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
      .task-title { margin: 0; font-size: 28px; flex: 1; }
      .task-title input {
        font-size: 28px;
        font-weight: 700;
        border: none;
        background: none;
        width: 100%;
        padding: 0;
      }
      .task-title input:focus { outline: none; }
      
      .task-status-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .status-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .status-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
      
      .avatar-group { display: flex; gap: -4px; }
      .avatar-group .avatar { margin-left: -6px; border: 2px solid white; }
      .avatar-group .avatar:first-child { margin-left: 0; }
      
      .multi-assignee-wrapper { display: flex; align-items: center; gap: 8px; position: relative; }
      .assignee-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 100;
        min-width: 200px;
        max-height: 200px;
        overflow-y: auto;
      }
      .assignee-checkbox-list { display: flex; flex-direction: column; gap: 2px; }
      .assignee-checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.15s;
      }
      .assignee-checkbox-label:hover { background: #f1f5f9; }
      .assignee-checkbox-label input { cursor: pointer; width: 16px; height: 16px; }
      
      .multi-select { min-height: 80px; }
      
      .task-description textarea {
        width: 100%;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 8px;
        padding: 16px;
        font-size: 15px;
        font-family: inherit;
        resize: vertical;
        min-height: 100px;
        line-height: 1.6;
      }
      .task-description textarea:focus { outline: 2px solid #2563eb; }
      
      .content-section {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-bottom: 24px;
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
      }
      .section-title { margin: 0; font-size: 16px; flex: 1; }
      .section-body { padding: 16px 20px; }
      
      .rich-editor-wrapper {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .rich-editor-wrapper:focus-within {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      
      .formatting-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 8px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        align-items: center;
      }
      .toolbar-group {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      .toolbar-divider {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        margin: 0 8px;
      }
      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #475569;
        transition: all 0.15s;
      }
      .toolbar-btn:hover { background: #e2e8f0; color: #0f172a; }
      .toolbar-btn.active { background: #dbeafe; color: #2563eb; }
      .toolbar-select {
        height: 32px;
        padding: 0 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        cursor: pointer;
        min-width: 100px;
      }
      .toolbar-select:hover { border-color: #94a3b8; }
      .toolbar-color-input {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 2px solid #e2e8f0;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
      }
      
      .rich-editor {
        min-height: 200px;
        padding: 16px;
        font-size: 15px;
        line-height: 1.7;
        outline: none;
      }
      .rich-editor h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px; }
      .rich-editor h2 { font-size: 22px; font-weight: 600; margin: 0 0 14px; }
      .rich-editor h3 { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
      .rich-editor p { margin: 0 0 12px; }
      .rich-editor ul, .rich-editor ol { margin: 0 0 12px; padding-left: 24px; }
      .rich-editor blockquote { margin: 0 0 12px; padding: 12px 16px; border-left: 4px solid #2563eb; background: #f1f5f9; }
      .rich-editor pre { margin: 0 0 12px; padding: 16px; background: #1e293b; color: #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 13px; }
      .rich-editor code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
      .rich-editor table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      .rich-editor th, .rich-editor td { border: 1px solid #e2e8f0; padding: 8px 12px; }
      .rich-editor th { background: #f8fafc; font-weight: 600; }
      .rich-editor img { max-width: 100%; height: auto; border-radius: 8px; }
      .rich-editor video { max-width: 100%; border-radius: 8px; }
      
      .resizable-media {
        display: inline-block;
        position: relative;
        margin: 8px 0;
        user-select: none;
      }
      .resizable-media img, .resizable-media video {
        display: block;
        border-radius: 8px;
      }
      .resizable-media:hover .resize-handle,
      .resizable-media:focus-within .resize-handle {
        opacity: 1;
      }
      .resize-handle {
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 16px;
        height: 16px;
        background: #2563eb;
        border: 2px solid white;
        border-radius: 4px;
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.15s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .resize-handle::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 6px;
        height: 6px;
        border-right: 2px solid white;
        border-bottom: 2px solid white;
      }
      
      .inline-file {
        display: inline-block;
        margin: 8px 0;
      }
      .file-download-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #1e293b;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.15s;
      }
      .file-download-link:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
        text-decoration: none;
      }
      
      .checklist-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .checklist-item:last-child { border-bottom: none; }
      .checklist-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
      .checklist-title { flex: 1; font-size: 14px; }
      .checklist-title.completed { text-decoration: line-through; color: #94a3b8; }
      .checklist-completed-by { font-size: 11px; color: #94a3b8; }
      
      .add-checklist-form {
        display: flex;
        gap: 8px;
        padding-top: 12px;
        margin-top: 12px;
        border-top: 1px solid #e2e8f0;
      }
      .add-checklist-form input { flex: 1; }
      
      .attachments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }
      .attachment-item {
        position: relative;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .attachment-link { display: block; text-decoration: none; color: inherit; }
      .attachment-preview { width: 100%; height: 100px; object-fit: cover; }
      .attachment-icon { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: #f8fafc; }
      .attachment-name { display: block; padding: 8px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .attachment-item .btn { position: absolute; top: 4px; right: 4px; }
      
      .upload-zone {
        border: 2px dashed #e2e8f0;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s;
      }
      .upload-zone:hover { border-color: #2563eb; background: #f8fafc; }
      
      /* Live collaboration styles */
      .active-users {
        position: fixed;
        top: 70px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 250px;
      }
      .active-users-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 8px;
      }
      .active-user {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        font-size: 13px;
      }
      .active-user .avatar {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }
      .active-user .editing-indicator {
        font-size: 11px;
        font-style: italic;
        margin-left: 4px;
      }
      
      /* Field editing indicator - floating badge above field */
      .field-editor-badge {
        position: absolute;
        top: -28px;
        left: 0;
        display: flex;
        gap: 6px;
        z-index: 100;
      }
      .editor-badge {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        animation: badge-appear 0.2s ease-out;
      }
      .editor-badge::before {
        content: '✎';
        font-size: 10px;
      }
      @keyframes badge-appear {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Border highlight for remote editing */
      .remote-editing-border {
        outline: 2px solid var(--editor-color, #3b82f6) !important;
        outline-offset: 2px;
      }
      
      .live-update-flash {
        animation: flash-update 0.5s ease-out;
      }
      @keyframes flash-update {
        0% { background-color: rgba(59, 130, 246, 0.2); }
        100% { background-color: transparent; }
      }
      
      /* Rich editor and editable fields need relative positioning and margin for badges */
      .rich-editor-wrapper, .task-title, .task-description {
        position: relative;
        margin-top: 32px;
      }
      .rich-editor {
        position: relative;
      }
      
      /* Content Checklist Styles */
      .content-checklist {
        margin: 12px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        overflow: hidden;
      }
      .content-checklist-header {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        background: #fff;
        cursor: pointer;
        gap: 10px;
        border-bottom: 1px solid transparent;
        transition: background 0.15s;
      }
      .content-checklist-header:hover {
        background: #f1f5f9;
      }
      .content-checklist.expanded .content-checklist-header {
        border-bottom-color: #e2e8f0;
      }
      .content-checklist-toggle {
        font-size: 12px;
        color: #64748b;
        transition: transform 0.2s;
        user-select: none;
      }
      .content-checklist.expanded .content-checklist-toggle {
        transform: rotate(90deg);
      }
      .content-checklist-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #22c55e;
      }
      .content-checklist-title {
        flex: 1;
        font-weight: 500;
        color: #1e293b;
        outline: none;
        min-width: 50px;
      }
      .content-checklist-title:empty::before {
        content: 'Checklist item...';
        color: #94a3b8;
      }
      .content-checklist.checked .content-checklist-title {
        text-decoration: line-through;
        color: #64748b;
      }
      .content-checklist-delete {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.15s, color 0.15s;
      }
      .content-checklist-header:hover .content-checklist-delete {
        opacity: 1;
      }
      .content-checklist-delete:hover {
        color: #ef4444;
      }
      .content-checklist-body {
        display: none;
        padding: 12px;
        background: #fff;
        min-height: 60px;
      }
      .content-checklist.expanded .content-checklist-body {
        display: block;
      }
      .content-checklist-body:empty::before {
        content: 'Add details, images, or videos here...';
        color: #94a3b8;
        font-style: italic;
      }
      .content-checklist-body img,
      .content-checklist-body video {
        max-width: 100%;
        border-radius: 6px;
        margin: 8px 0;
      }
      
      ${task.is_completed ? `
        .task-header { border-left: 5px solid #22c55e; }
      ` : ''}
    </style>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">My Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/systems/history">History</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>
    
    <!-- Active Users Panel -->
    <div class="active-users" id="activeUsersPanel" style="display: none;">
      <div class="active-users-title">👥 Viewing this task</div>
      <div id="activeUsersList"></div>
    </div>
    
    <div class="container">
      <div style="margin-bottom: 16px; display: flex; gap: 8px;">
        <a href="/systems/${system.id}" class="btn btn-secondary btn-sm">← Back to ${escapeHtml(system.name)}</a>
      </div>
      
      <!-- Task Header -->
      <div class="task-header">
        <div class="task-title-row">
          <div style="margin-right: 12px;">
            <input type="checkbox" id="taskCompleted" ${task.is_completed ? 'checked' : ''} style="width: 24px; height: 24px; cursor: pointer;" onchange="toggleCompleted(this.checked)">
          </div>
          <h1 class="task-title">
            <input type="text" id="taskTitle" value="${escapeHtml(task.title)}" onblur="updateTask()">
          </h1>
          <button class="btn btn-danger" onclick="deleteTask()">Delete</button>
        </div>
        
        <div class="task-status-bar">
          <div class="status-item">
            <span class="status-label">Status</span>
            <span class="badge ${task.is_completed ? 'badge-green' : 'badge-blue'}">${task.is_completed ? 'Completed' : 'Open'}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Priority</span>
            <select id="taskPriority" class="form-select" style="width: auto;" onchange="updateTask()">
              ${priorityOptions}
            </select>
          </div>
          <div class="status-item">
            <span class="status-label">Assigned To</span>
            <div class="multi-assignee-wrapper">
              ${assigneeAvatars ? `<div class="avatar-group">${assigneeAvatars}</div>` : '<span style="color: #94a3b8; font-size: 13px;">Unassigned</span>'}
              <button type="button" class="btn btn-sm btn-secondary" onclick="toggleAssigneeDropdown(event)">Edit</button>
              <div id="assigneeDropdown" class="assignee-dropdown" style="display: none;">
                <div class="assignee-checkbox-list">
                  ${userCheckboxes}
                </div>
              </div>
            </div>
          </div>
          <div class="status-item">
            <span class="status-label">Due Date</span>
            <input type="date" id="taskDueDate" class="form-input" style="width: auto;" value="${task.due_date || ''}" onchange="updateTask()">
          </div>
        </div>
        
        ${task.completed_by && task.is_completed ? `
          <div style="font-size: 13px; color: #22c55e;">
            ✓ Completed by ${escapeHtml(task.completed_by)} on ${task.completed_at ? new Date(task.completed_at).toLocaleString() : ''}
          </div>
        ` : ''}
        
        ${tags ? `<div class="system-tags" style="margin-top: 12px;">${tags}</div>` : ''}
      </div>
      
      <!-- Description Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📝 Description</h2>
        </div>
        <div class="section-body">
          <div class="task-description">
            <textarea id="taskDescription" placeholder="Add a detailed description..." onblur="updateTask()">${escapeHtml(task.description || '')}</textarea>
          </div>
        </div>
      </div>
      
      <!-- Content Section (rich text like Google Docs) -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📄 Content</h2>
        </div>
        <div class="section-body">
          <div class="rich-editor-wrapper">
            <div class="formatting-toolbar">
              <div class="toolbar-group">
                <select class="toolbar-select" onchange="formatBlock(this.value); this.value='';" title="Text Style">
                  <option value="">Style</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="p">Paragraph</option>
                  <option value="pre">Code Block</option>
                  <option value="blockquote">Quote</option>
                </select>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('bold')" title="Bold"><b>B</b></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('italic')" title="Italic"><i>I</i></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('underline')" title="Underline"><u>U</u></button>
                <button type="button" class="toolbar-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><s>S</s></button>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <input type="color" class="toolbar-color-input" value="#000000" onchange="execCmd('foreColor', this.value)" title="Text Color">
                <input type="color" class="toolbar-color-input" value="#ffffff" onchange="execCmd('backColor', this.value)" title="Highlight">
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="execCmd('insertUnorderedList')" title="Bullet List">•≡</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('insertOrderedList')" title="Numbered List">1.</button>
              </div>
              <div class="toolbar-divider"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" onclick="insertLink()" title="Insert Link">🔗</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('image')" title="Upload Image">🖼️</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('video')" title="Upload Video">🎬</button>
                <button type="button" class="toolbar-btn" onclick="triggerFileUpload('file')" title="Upload File">📎</button>
                <button type="button" class="toolbar-btn" onclick="insertContentChecklist()" title="Insert Checklist">☑️</button>
                <button type="button" class="toolbar-btn" onclick="execCmd('removeFormat')" title="Clear Formatting">✖</button>
                <input type="file" id="inlineFileInput" style="display:none" onchange="handleFileUpload(this)" accept="*/*">
              </div>
            </div>
            <div class="rich-editor" contenteditable="true" id="taskContent" onblur="updateTask()" oninput="autoSave()">${task.content || ''}</div>
          </div>
        </div>
      </div>
      
      <!-- Checklist Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">☑️ Checklist (${(checklist || []).length})</h2>
        </div>
        <div class="section-body">
          ${(checklist || []).length > 0 ? `
            <div class="checklist-items">
              ${checklistItems}
            </div>
          ` : `
            <p style="color: #94a3b8; font-size: 14px;">No checklist items yet.</p>
          `}
          <form class="add-checklist-form" onsubmit="addChecklistItem(event)">
            <input type="text" id="newChecklistItem" class="form-input" placeholder="Add checklist item...">
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </form>
        </div>
      </div>
      
      <!-- Attachments Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">📎 Attachments (${(attachments || []).length})</h2>
        </div>
        <div class="section-body">
          ${(attachments || []).length > 0 ? `
            <div class="attachments-grid" style="margin-bottom: 16px;">
              ${attachmentsList}
            </div>
          ` : ''}
          <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
            <input type="file" id="fileInput" multiple style="display: none;" onchange="uploadFiles(this.files)">
            <p style="margin: 0; color: #64748b;">Drop files here or click to upload</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Images, videos, documents</p>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      var systemId = ${system.id};
      var taskId = ${task.id};
      
      // Client-side escapeHtml function
      function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }
      
      function toggleAssigneeDropdown(event) {
        if (event) event.stopPropagation();
        var dropdown = document.getElementById('assigneeDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      }
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        var dropdown = document.getElementById('assigneeDropdown');
        if (!dropdown) return;
        var isInside = e.target.closest('.multi-assignee-wrapper');
        if (!isInside && dropdown.style.display !== 'none') {
          dropdown.style.display = 'none';
        }
      });
      
      // Rich Text Editor Functions
      function execCmd(command, value) {
        document.execCommand(command, false, value || null);
        document.getElementById('taskContent').focus();
      }
      
      function formatBlock(tag) {
        if (tag) {
          document.execCommand('formatBlock', false, '<' + tag + '>');
          document.getElementById('taskContent').focus();
        }
      }
      
      function insertLink() {
        var url = prompt('Enter URL:', 'https://');
        if (url) {
          var selection = window.getSelection();
          var text = selection.toString() || url;
          document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank">' + text + '</a>');
        }
      }
      
      var currentUploadType = 'file';
      function triggerFileUpload(type) {
        currentUploadType = type;
        var input = document.getElementById('inlineFileInput');
        if (type === 'image') {
          input.accept = 'image/*';
        } else if (type === 'video') {
          input.accept = 'video/*';
        } else {
          input.accept = '*/*';
        }
        input.click();
      }
      
      async function handleFileUpload(input) {
        if (!input.files || !input.files.length) return;
        var file = input.files[0];
        await uploadAndInsertMedia(file);
        input.value = '';
      }
      
      // Auto-save with debounce
      var autoSaveTimer;
      function autoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
          updateTask();
        }, 1000);
      }
      
      // Insert content checklist
      function insertContentChecklist() {
        var id = 'cl-' + Date.now();
        var html = '<div class="content-checklist" data-checklist-id="' + id + '" contenteditable="false">' +
          '<div class="content-checklist-header" onclick="toggleContentChecklist(this.parentElement)">' +
            '<span class="content-checklist-toggle">▶</span>' +
            '<input type="checkbox" class="content-checklist-checkbox" onclick="event.stopPropagation(); toggleChecklistChecked(this)">' +
            '<span class="content-checklist-title" contenteditable="true" onclick="event.stopPropagation()" onblur="triggerContentUpdate()"></span>' +
            '<button class="content-checklist-delete" onclick="event.stopPropagation(); deleteContentChecklist(this)" title="Delete">&times;</button>' +
          '</div>' +
          '<div class="content-checklist-body" contenteditable="true" onblur="triggerContentUpdate()"></div>' +
        '</div><p></p>';
        document.execCommand('insertHTML', false, html);
        // Focus the title
        setTimeout(function() {
          var checklist = document.querySelector('[data-checklist-id="' + id + '"]');
          if (checklist) {
            var title = checklist.querySelector('.content-checklist-title');
            if (title) title.focus();
          }
        }, 10);
      }
      
      function toggleContentChecklist(el) {
        el.classList.toggle('expanded');
        triggerContentUpdate();
      }
      
      function toggleChecklistChecked(checkbox) {
        var checklist = checkbox.closest('.content-checklist');
        if (checklist) {
          checklist.classList.toggle('checked', checkbox.checked);
          // Set the checked attribute so it persists in innerHTML
          if (checkbox.checked) {
            checkbox.setAttribute('checked', 'checked');
          } else {
            checkbox.removeAttribute('checked');
          }
          triggerContentUpdate();
        }
      }
      
      function deleteContentChecklist(btn) {
        var checklist = btn.closest('.content-checklist');
        if (checklist && confirm('Delete this checklist item?')) {
          checklist.remove();
          triggerContentUpdate();
        }
      }
      
      function triggerContentUpdate() {
        // Debounced content update
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
          updateTask();
          // Also emit socket event
          var content = document.getElementById('taskContent');
          if (content && typeof socket !== 'undefined') {
            socket.emit('content-update', { room: room, field: 'taskContent', value: content.innerHTML, username: currentUsername });
          }
        }, 500);
      }
      
      // Paste image/video/file handler
      document.getElementById('taskContent').addEventListener('paste', function(e) {
        var clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData || !clipboardData.items) return;
        
        var items = clipboardData.items;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.kind === 'file') {
            e.preventDefault();
            var file = item.getAsFile();
            if (file) {
              uploadAndInsertMedia(file);
            }
            return;
          }
        }
      });
      
      // Also handle drop events
      document.getElementById('taskContent').addEventListener('drop', function(e) {
        e.preventDefault();
        var files = e.dataTransfer.files;
        if (files && files.length > 0) {
          uploadAndInsertMedia(files[0]);
        }
      });
      
      document.getElementById('taskContent').addEventListener('dragover', function(e) {
        e.preventDefault();
      });
      
      function uploadAndInsertMedia(file) {
        if (!file) return;
        
        // Show uploading indicator with progress bar
        var tempId = 'uploading-' + Date.now();
        var uploadingHtml = '<div id="' + tempId + '" style="display: inline-block; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 4px 0; min-width: 200px;">' +
          '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
            '<span style="color: #64748b;">⏳</span>' +
            '<span style="color: #475569; font-size: 13px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + file.name + '</span>' +
            '<span class="upload-percent" style="color: #3b82f6; font-weight: 600; font-size: 12px;">0%</span>' +
          '</div>' +
          '<div style="background: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden;">' +
            '<div class="upload-progress-bar" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: 0%; transition: width 0.2s;"></div>' +
          '</div>' +
        '</div>';
        document.execCommand('insertHTML', false, uploadingHtml);
        
        var formData = new FormData();
        formData.append('files', file);
        
        var xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            var percent = Math.round((e.loaded / e.total) * 100);
            var uploadingEl = document.getElementById(tempId);
            if (uploadingEl) {
              var progressBar = uploadingEl.querySelector('.upload-progress-bar');
              var percentText = uploadingEl.querySelector('.upload-percent');
              if (progressBar) progressBar.style.width = percent + '%';
              if (percentText) percentText.textContent = percent + '%';
            }
          }
        });
        
        xhr.addEventListener('load', function() {
          var uploadingEl = document.getElementById(tempId);
          if (uploadingEl) uploadingEl.remove();
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var attachments = JSON.parse(xhr.responseText);
              
              if (attachments && attachments.length > 0) {
                var att = attachments[0];
                var url = '/uploads/' + att.filename;
                var mimeType = att.mime_type || '';
                var html;
                
                if (mimeType.startsWith('image/')) {
                  html = '<div class="resizable-media" contenteditable="false"><img src="' + url + '" style="max-width: 100%; width: 400px;"><div class="resize-handle"></div></div>';
                } else if (mimeType.startsWith('video/')) {
                  html = '<div class="resizable-media" contenteditable="false"><video src="' + url + '" controls style="max-width: 100%; width: 400px;"></video><div class="resize-handle"></div></div>';
                } else {
                  // For other files, show a download link
                  var icon = '📄';
                  if (mimeType.startsWith('audio/')) icon = '🎵';
                  else if (mimeType.includes('pdf')) icon = '📕';
                  else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) icon = '📦';
                  else if (mimeType.includes('word') || mimeType.includes('document')) icon = '📝';
                  else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) icon = '📊';
                  
                  html = '<div class="inline-file" contenteditable="false"><a href="' + url + '" download="' + (att.original_name || att.filename) + '" class="file-download-link">' + icon + ' ' + (att.original_name || att.filename) + '</a></div>';
                }
                
                // Insert at cursor position
                var selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  var range = selection.getRangeAt(0);
                  var div = document.createElement('div');
                  div.innerHTML = html + '<p><br></p>';
                  var frag = document.createDocumentFragment();
                  while (div.firstChild) {
                    frag.appendChild(div.firstChild);
                  }
                  range.insertNode(frag);
                  range.collapse(false);
                } else {
                  document.execCommand('insertHTML', false, html + '<p></p>');
                }
                
                initResizeHandles();
                autoSave();
              }
            } catch (e) {
              console.error('Error parsing upload response:', e);
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            document.execCommand('insertHTML', false, '<span style="color: #ef4444;">❌ Upload failed</span>');
          }
        });
        
        xhr.addEventListener('error', function() {
          console.error('Error uploading media');
          var uploadingEl = document.getElementById(tempId);
          if (uploadingEl) {
            uploadingEl.innerHTML = '<span style="color: #ef4444;">❌ Upload failed</span>';
          }
        });
        
        xhr.open('POST', '/api/tasks/' + taskId + '/attachments');
        xhr.send(formData);
      }
      
      // Resizable media functionality
      function initResizeHandles() {
        document.querySelectorAll('.resizable-media').forEach(function(wrapper) {
          var handle = wrapper.querySelector('.resize-handle');
          var media = wrapper.querySelector('img, video');
          if (!handle || !media) return;
          
          handle.onmousedown = function(e) {
            e.preventDefault();
            var startX = e.clientX;
            var startWidth = media.offsetWidth;
            
            function onMouseMove(e) {
              var newWidth = startWidth + (e.clientX - startX);
              if (newWidth > 50 && newWidth < 1200) {
                media.style.width = newWidth + 'px';
              }
            }
            
            function onMouseUp() {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              autoSave();
              // Emit content update for live sync
              if (socket) {
                var content = document.getElementById('taskContent');
                if (content) {
                  socket.emit('content-update', { room: room, field: 'taskContent', value: content.innerHTML, username: currentUsername });
                }
              }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          };
        });
      }
      
      // Initialize on load
      initResizeHandles();
      
      async function updateTask() {
        var assignees = [];
        document.querySelectorAll('.assignee-checkbox:checked').forEach(function(cb) {
          assignees.push(cb.value);
        });
        var data = {
          title: document.getElementById('taskTitle').value,
          description: document.getElementById('taskDescription').value,
          content: document.getElementById('taskContent').innerHTML,
          priority: document.getElementById('taskPriority').value,
          assigned_to: assignees.join(','),
          due_date: document.getElementById('taskDueDate').value
        };
        try {
          await fetch('/api/tasks/' + taskId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        } catch (e) {
          console.error('Error updating task:', e);
        }
      }
      
      async function toggleCompleted(completed) {
        try {
          await fetch('/api/tasks/' + taskId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: completed })
          });
          location.reload();
        } catch (e) {
          console.error('Error toggling task:', e);
        }
      }
      
      async function deleteTask() {
        if (!confirm('Delete this task?')) return;
        try {
          await fetch('/api/tasks/' + taskId, { method: 'DELETE' });
          window.location.href = '/systems/' + systemId;
        } catch (e) {
          console.error('Error deleting task:', e);
        }
      }
      
      async function addChecklistItem(e) {
        e.preventDefault();
        var input = document.getElementById('newChecklistItem');
        var title = input.value.trim();
        if (!title) return;
        try {
          var response = await fetch('/api/tasks/' + taskId + '/checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
          });
          var item = await response.json();
          console.log('Checklist item added:', item);
          input.value = '';
          
          // Add item to DOM dynamically
          addChecklistItemToDOM(item);
          
          // Emit socket event
          console.log('Socket status:', socket ? 'connected' : 'null');
          if (socket) {
            socket.emit('checklist-add', { room: room, item: item, username: currentUsername });
          }
        } catch (err) {
          console.error('Error adding checklist item:', err);
        }
      }
      
      function addChecklistItemToDOM(item) {
        console.log('addChecklistItemToDOM called with:', item);
        var container = document.querySelector('.checklist-items');
        console.log('Found container:', container);
        if (!container) {
          // Create container if it doesn't exist - find the form and insert before it
          var form = document.querySelector('.add-checklist-form');
          console.log('Found form:', form);
          if (!form) return;
          var sectionBody = form.parentElement;
          if (!sectionBody) return;
          // Remove "No checklist items yet" message if present
          var noItems = sectionBody.querySelector('p');
          if (noItems && noItems.textContent.includes('No checklist')) noItems.remove();
          container = document.createElement('div');
          container.className = 'checklist-items';
          sectionBody.insertBefore(container, form);
          console.log('Created new container:', container);
        }
        
        var div = document.createElement('div');
        div.className = 'checklist-item';
        div.setAttribute('data-item-id', item.id);
        div.innerHTML = '<input type="checkbox" onchange="toggleChecklistItem(' + item.id + ', this.checked)">' +
          '<span class="checklist-title">' + escapeHtml(item.title) + '</span>' +
          '<button class="btn btn-icon btn-sm" onclick="deleteChecklistItem(' + item.id + ')" style="opacity: 0.5;">&times;</button>';
        container.appendChild(div);
        flashElement(div);
        
        // Update count in header
        updateChecklistCount();
      }
      
      function updateChecklistCount() {
        var count = document.querySelectorAll('.checklist-item').length;
        var headers = document.querySelectorAll('.section-title');
        headers.forEach(function(h) {
          if (h.textContent.includes('Checklist')) {
            h.textContent = '☑️ Checklist (' + count + ')';
          }
        });
      }
      
      async function toggleChecklistItem(itemId, completed) {
        try {
          await fetch('/api/checklist/' + itemId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: completed })
          });
          // Emit socket event
          if (socket) {
            socket.emit('checklist-toggle', { room: room, itemId: itemId, completed: completed, username: currentUsername });
          }
          // Update UI
          var item = document.querySelector('[data-item-id="' + itemId + '"]');
          if (item) {
            var title = item.querySelector('.checklist-title');
            if (title) title.classList.toggle('completed', completed);
          }
        } catch (e) {
          console.error('Error toggling checklist item:', e);
        }
      }
      
      async function deleteChecklistItem(itemId) {
        try {
          await fetch('/api/checklist/' + itemId, { method: 'DELETE' });
          // Emit socket event
          if (socket) {
            socket.emit('checklist-delete', { room: room, itemId: itemId, username: currentUsername });
          }
          // Remove from DOM
          var item = document.querySelector('[data-item-id="' + itemId + '"]');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() {
              item.remove();
              updateChecklistCount();
            }, 300);
          }
        } catch (e) {
          console.error('Error deleting checklist item:', e);
        }
      }
      
      async function deleteAttachment(attId) {
        if (!confirm('Delete this attachment?')) return;
        try {
          await fetch('/api/attachments/' + attId, { method: 'DELETE' });
          // Emit socket event
          if (socket) {
            socket.emit('attachment-delete', { room: room, attachmentId: attId, username: currentUsername });
          }
          // Remove from DOM
          var item = document.querySelector('[data-attachment-id="' + attId + '"]');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() {
              item.remove();
              // Update count
              var countHeader = document.querySelector('.section-title');
              if (countHeader && countHeader.textContent.includes('Attachments')) {
                var count = document.querySelectorAll('.attachment-item').length;
                countHeader.textContent = '\ud83d\udcce Attachments (' + count + ')';
              }
            }, 300);
          }
        } catch (e) {
          console.error('Error deleting attachment:', e);
        }
      }
      
      // File upload
      var uploadZone = document.getElementById('uploadZone');
      uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
      });
      uploadZone.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
      });
      uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        uploadFiles(e.dataTransfer.files);
      });
      
      async function uploadFiles(files) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
        try {
          console.log('Uploading files...');
          var response = await fetch('/api/tasks/' + taskId + '/attachments', {
            method: 'POST',
            body: formData
          });
          var attachments = await response.json();
          console.log('Upload response:', attachments);
          // Add attachments to DOM dynamically
          if (attachments && attachments.length > 0) {
            attachments.forEach(function(att) {
              console.log('Adding attachment to DOM:', att);
              addAttachmentToDOM(att);
              // Notify other users
              console.log('Socket status for attachment:', socket ? 'connected' : 'null');
              if (socket) {
                socket.emit('attachment-add', { room: room, attachment: att, username: currentUsername });
              }
            });
          }
        } catch (err) {
          console.error('Error uploading files:', err);
        }
      }
      
      function addAttachmentToDOM(att) {
        console.log('addAttachmentToDOM called with:', att);
        var grid = document.querySelector('.attachments-grid');
        console.log('Found grid:', grid);
        if (!grid) {
          // Create grid if it doesn't exist - find uploadZone and insert before it
          var uploadZone = document.getElementById('uploadZone');
          if (!uploadZone) return;
          var sectionBody = uploadZone.parentElement;
          if (!sectionBody) return;
          grid = document.createElement('div');
          grid.className = 'attachments-grid';
          grid.style.marginBottom = '16px';
          sectionBody.insertBefore(grid, uploadZone);
        }
        
        var div = document.createElement('div');
        div.className = 'attachment-item';
        div.setAttribute('data-attachment-id', att.id);
        
        var preview = '';
        if (att.mime_type && att.mime_type.startsWith('image/')) {
          preview = '<img src="/uploads/' + att.filename + '" class="attachment-preview" alt="' + escapeHtml(att.original_name) + '">';
        } else if (att.mime_type && att.mime_type.startsWith('video/')) {
          preview = '<video src="/uploads/' + att.filename + '" class="attachment-preview"></video>';
        } else {
          preview = '<div class="attachment-icon">\ud83d\udcce</div>';
        }
        
        div.innerHTML = '<a href="/uploads/' + att.filename + '" target="_blank" class="attachment-link">' +
          preview +
          '<span class="attachment-name">' + escapeHtml(att.original_name) + '</span>' +
          '</a>' +
          '<button class="btn btn-icon btn-danger btn-sm" onclick="deleteAttachment(' + att.id + ')">\ud83d\uddd1</button>';
        
        grid.appendChild(div);
        
        // Flash to show it was added
        flashElement(div);
        
        // Update count in header
        updateAttachmentCount();
      }
      
      function updateAttachmentCount() {
        var count = document.querySelectorAll('.attachment-item').length;
        var headers = document.querySelectorAll('.section-title');
        headers.forEach(function(h) {
          if (h.textContent.includes('Attachments')) {
            h.textContent = '\ud83d\udcce Attachments (' + count + ')';
          }
        });
      }
      
      // ============ LIVE COLLABORATION ============
      var socket = null;
      var room = 'task:' + taskId;
      var currentUsername = '${currentUser || "Anonymous"}';
      var mySocketId = null;
      var updateDebounceTimers = {};
      var activeEditors = {}; // Track who's editing what field
      var isSendingUpdate = false;
      
      function initSocket() {
        socket = io();
        
        socket.on('connect', function() {
          console.log('Connected to live updates');
          mySocketId = socket.id;
          socket.emit('join', { room: room, username: currentUsername });
        });
        
        // Active users updated
        socket.on('users-updated', function(data) {
          var panel = document.getElementById('activeUsersPanel');
          var list = document.getElementById('activeUsersList');
          var users = (data.users || []).filter(function(u) { return u.socketId !== mySocketId; });
          
          if (users.length > 0) {
            panel.style.display = 'block';
            list.innerHTML = users.map(function(u) {
              var color = u.color || '#3b82f6';
              var editingField = u.editing || '';
              var editingText = editingField ? '<span class="editing-indicator" style="color:' + color + '"> — editing</span>' : '';
              return '<div class="active-user"><span class="avatar" style="background:' + color + '">' + u.username.charAt(0).toUpperCase() + '</span> ' + u.username + editingText + '</div>';
            }).join('');
          } else {
            panel.style.display = 'none';
          }
        });
        
        // Someone started editing a field
        socket.on('user-editing', function(data) {
          if (data.socketId === mySocketId) return;
          activeEditors[data.field] = activeEditors[data.field] || {};
          activeEditors[data.field][data.socketId] = { username: data.username, color: data.color, socketId: data.socketId };
          updateFieldIndicators(data.field);
        });
        
        // Someone stopped editing
        socket.on('user-stopped-editing', function(data) {
          if (data.socketId === mySocketId) return;
          if (activeEditors[data.field]) {
            delete activeEditors[data.field][data.socketId];
          }
          updateFieldIndicators(data.field);
        });
        
        // Content changed by another user
        socket.on('content-changed', function(data) {
          if (data.fromSocketId === mySocketId) return;
          
          var field = document.getElementById(data.field);
          if (!field) return;
          
          // Don't accept empty/null updates
          if (data.value === null || data.value === undefined) return;
          
          // Always apply remote updates immediately to keep clients in sync
          applyRemoteUpdate(field, data.value);
        });
        
        // Property changed (priority, assignees, due date)
        socket.on('property-changed', function(data) {
          if (data.fromSocketId === mySocketId) return;
          
          if (data.property === 'priority') {
            var sel = document.getElementById('taskPriority');
            if (sel && document.activeElement !== sel) {
              sel.value = data.value;
              flashElement(sel);
            }
          } else if (data.property === 'assigned_to') {
            var assignees = data.value ? data.value.split(',').map(function(a) { return a.trim(); }) : [];
            document.querySelectorAll('.assignee-checkbox').forEach(function(cb) {
              cb.checked = assignees.includes(cb.value);
            });
            updateAssigneeAvatars(assignees);
          } else if (data.property === 'due_date') {
            var dateInput = document.getElementById('taskDueDate');
            if (dateInput && document.activeElement !== dateInput) {
              dateInput.value = data.value || '';
              flashElement(dateInput);
            }
          } else if (data.property === 'is_completed') {
            var cb = document.getElementById('taskCompleted');
            if (cb) cb.checked = data.value;
            flashElement(document.querySelector('.task-header'));
          }
        });
        
        // Checklist item toggled
        socket.on('checklist-toggled', function(data) {
          var item = document.querySelector('[data-item-id="' + data.itemId + '"]');
          if (item) {
            var checkbox = item.querySelector('input[type="checkbox"]');
            var title = item.querySelector('.checklist-title');
            if (checkbox) checkbox.checked = data.completed;
            if (title) title.classList.toggle('completed', data.completed);
            flashElement(item);
          }
        });
        
        // Checklist item added/deleted
        socket.on('checklist-added', function(data) {
          addChecklistItemToDOM(data.item);
        });
        socket.on('checklist-deleted', function(data) {
          var item = document.querySelector('[data-item-id="' + data.itemId + '"]');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() {
              item.remove();
              updateChecklistCount();
            }, 300);
          }
        });
        
        // Attachments
        socket.on('attachment-added', function(data) {
          addAttachmentToDOM(data.attachment);
        });
        socket.on('attachment-deleted', function(data) {
          var item = document.querySelector('[data-attachment-id="' + data.attachmentId + '"]');
          if (item) {
            item.style.transition = 'opacity 0.3s';
            item.style.opacity = '0';
            setTimeout(function() {
              item.remove();
              updateAttachmentCount();
            }, 300);
          }
        });
        
        socket.on('disconnect', function() {
          console.log('Disconnected from live updates');
        });
      }
      
      function flashElement(el) {
        if (!el) return;
        el.classList.add('live-update-flash');
        setTimeout(function() { el.classList.remove('live-update-flash'); }, 500);
      }
      
      function applyRemoteUpdate(field, value) {
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
          if (field.value !== value) {
            field.value = value;
            flashElement(field);
          }
        } else if (field.contentEditable === 'true') {
          if (field.innerHTML !== value) {
            field.innerHTML = value;
            flashElement(field);
          }
        }
      }
      
      // Update assignee avatars display
      function updateAssigneeAvatars(assignees) {
        var wrapper = document.querySelector('.multi-assignee-wrapper');
        if (!wrapper) return;
        var avatarGroup = wrapper.querySelector('.avatar-group');
        if (!avatarGroup && assignees.length > 0) {
          avatarGroup = document.createElement('div');
          avatarGroup.className = 'avatar-group';
          wrapper.insertBefore(avatarGroup, wrapper.firstChild);
        }
        if (avatarGroup) {
          if (assignees.length > 0) {
            avatarGroup.innerHTML = assignees.map(function(a) {
              return '<span class="avatar" title="' + a + '">' + a.charAt(0).toUpperCase() + '</span>';
            }).join('');
          } else {
            avatarGroup.innerHTML = '<span style="color: #94a3b8; font-size: 13px;">Unassigned</span>';
          }
        }
      }
      
      // Update field indicators (badges and border)
      function updateFieldIndicators(fieldId) {
        var field = document.getElementById(fieldId);
        if (!field) return;
        
        var wrapper = field.closest('.task-title, .task-description, .rich-editor-wrapper');
        if (!wrapper) wrapper = field.parentElement;
        wrapper.style.position = 'relative';
        
        var editors = activeEditors[fieldId] || {};
        var editorList = Object.values(editors);
        
        var badgeContainer = wrapper.querySelector('.field-editor-badge');
        
        if (editorList.length === 0) {
          if (badgeContainer) badgeContainer.remove();
          field.classList.remove('remote-editing-border');
          field.style.removeProperty('--editor-color');
          return;
        }
        
        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'field-editor-badge';
          wrapper.appendChild(badgeContainer);
        }
        
        badgeContainer.innerHTML = editorList.map(function(e) {
          return '<span class="editor-badge" style="background:' + (e.color || '#3b82f6') + '">' + e.username + '</span>';
        }).join('');
        
        var firstEditor = editorList[0];
        field.classList.add('remote-editing-border');
        field.style.setProperty('--editor-color', firstEditor.color || '#3b82f6');
      }
      
      // Track focus/blur for editing indication
      function setupEditingTracking() {
        var fields = ['taskTitle', 'taskDescription', 'taskContent'];
        
        fields.forEach(function(fieldId) {
          var field = document.getElementById(fieldId);
          if (!field) return;
          
          // Focus - start editing
          field.addEventListener('focus', function() {
            if (socket) socket.emit('editing-start', { room: room, field: fieldId, username: currentUsername });
          });
          
          // Blur - stop editing
          field.addEventListener('blur', function() {
            if (socket) socket.emit('editing-stop', { room: room, field: fieldId, username: currentUsername });
          });
          
          // Content changes with debounce
          field.addEventListener('input', function() {
            if (isSendingUpdate) return;
            
            clearTimeout(updateDebounceTimers[fieldId]);
            updateDebounceTimers[fieldId] = setTimeout(function() {
              var value;
              if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                value = field.value;
              } else {
                value = field.innerHTML;
              }
              
              if (socket) {
                isSendingUpdate = true;
                socket.emit('content-update', { 
                  room: room, 
                  field: fieldId, 
                  value: value, 
                  username: currentUsername 
                });
                isSendingUpdate = false;
              }
            }, 100); // Fast debounce for responsive updates
          });
        });
      }
      
      // Override updateTask to emit socket events
      var originalUpdateTask = updateTask;
      updateTask = async function() {
        await originalUpdateTask();
        
        if (!socket) return;
        
        var priority = document.getElementById('taskPriority').value;
        var dueDate = document.getElementById('taskDueDate').value;
        var assignees = [];
        document.querySelectorAll('.assignee-checkbox:checked').forEach(function(cb) {
          assignees.push(cb.value);
        });
        
        socket.emit('property-update', { room: room, property: 'priority', value: priority, username: currentUsername });
        socket.emit('property-update', { room: room, property: 'due_date', value: dueDate, username: currentUsername });
        socket.emit('property-update', { room: room, property: 'assigned_to', value: assignees.join(','), username: currentUsername });
      };
      
      // Override toggleCompleted
      var originalToggleCompleted = toggleCompleted;
      toggleCompleted = async function(completed) {
        if (socket) socket.emit('property-update', { room: room, property: 'is_completed', value: completed, username: currentUsername });
        await originalToggleCompleted(completed);
      };
      
      // Override toggleChecklistItem
      var originalToggleChecklistItem = toggleChecklistItem;
      toggleChecklistItem = async function(itemId, completed) {
        if (socket) socket.emit('checklist-toggle', { room: room, itemId: itemId, completed: completed, username: currentUsername });
        await originalToggleChecklistItem(itemId, completed);
      };
      
      // Override deleteChecklistItem
      var originalDeleteChecklistItem = deleteChecklistItem;
      deleteChecklistItem = async function(itemId) {
        if (socket) socket.emit('checklist-delete', { room: room, itemId: itemId, username: currentUsername });
        await originalDeleteChecklistItem(itemId);
      };
      
      // Override deleteAttachment
      var originalDeleteAttachment = deleteAttachment;
      deleteAttachment = async function(attId) {
        if (socket) socket.emit('attachment-delete', { room: room, attachmentId: attId, username: currentUsername });
        await originalDeleteAttachment(attId);
      };
      
      // Initialize
      initSocket();
      setupEditingTracking();
    </script>
  </body>
  </html>
  `;
}

function myTasksPage(opts) {
  const { tasks, systems, users, viewUser, currentUser, admin, escapeHtml } = opts;
  
  // Build user options for selector
  const userOptions = (users || []).map(u => 
    `<option value="${u.username}" ${viewUser === u.username ? 'selected' : ''}>${u.username}</option>`
  ).join('');
  
  const isViewingOwnTasks = viewUser === currentUser;
  
  // Group tasks by status
  const overdueTasks = tasks.filter(t => !t.is_completed && t.due_date && new Date(t.due_date) < new Date());
  const todayTasks = tasks.filter(t => {
    if (t.is_completed) return false;
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  });
  const upcomingTasks = tasks.filter(t => {
    if (t.is_completed) return false;
    if (!t.due_date) return true;
    const due = new Date(t.due_date);
    const today = new Date();
    return due > today && due.toDateString() !== today.toDateString();
  });
  const completedTasks = tasks.filter(t => t.is_completed);
  
  const renderTaskCard = (task, showSystem = true) => {
    const priorityClass = {
      low: 'badge-gray',
      medium: 'badge-blue',
      high: 'badge-yellow',
      urgent: 'badge-red'
    }[task.priority || 'medium'];
    
    const isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date();
    
    return `
      <div class="task-card ${task.is_completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox">
          <input type="checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTask(${task.id}, ${task.system_id}, this.checked)">
        </div>
        <div class="task-info">
          <a href="/systems/${task.system_id}/tasks/${task.id}" class="task-title">${escapeHtml(task.title)}</a>
          ${showSystem && task.system_name ? `
            <a href="/systems/${task.system_id}" class="task-system" style="border-left-color: ${task.system_color || '#3b82f6'};">
              ${escapeHtml(task.system_name)}
            </a>
          ` : ''}
          <div class="task-meta">
            <span class="badge ${priorityClass}">${task.priority || 'medium'}</span>
            ${task.due_date ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️' : '📅'} ${task.due_date}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  };
  
  const systemCards = (systems || []).map(s => `
    <a href="/systems/${s.id}" class="system-pill" style="border-left-color: ${s.color || '#3b82f6'};">
      ${escapeHtml(s.name)}
    </a>
  `).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My Tasks - Daily Logger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 24px;
      }
      @media (max-width: 900px) {
        .dashboard-grid { grid-template-columns: 1fr; }
      }
      
      .task-section {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
      }
      .task-section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .task-section-header h3 { margin: 0; font-size: 15px; font-weight: 600; flex: 1; }
      .task-section-header .count { 
        background: #e2e8f0; 
        color: #475569; 
        padding: 2px 10px; 
        border-radius: 12px; 
        font-size: 13px; 
        font-weight: 600;
      }
      .task-section.overdue .task-section-header { background: #fef2f2; border-color: #fecaca; }
      .task-section.overdue .count { background: #fecaca; color: #dc2626; }
      .task-section.today .task-section-header { background: #fefce8; border-color: #fef08a; }
      .task-section.today .count { background: #fef08a; color: #ca8a04; }
      
      .task-section-body { padding: 8px 12px; }
      .task-section-body:empty::after {
        content: 'No tasks';
        display: block;
        padding: 16px;
        text-align: center;
        color: #94a3b8;
      }
      
      .task-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        transition: background 0.15s;
      }
      .task-card:hover { background: #f8fafc; }
      .task-card.completed { opacity: 0.6; }
      .task-card.completed .task-title { text-decoration: line-through; color: #94a3b8; }
      .task-checkbox input { width: 18px; height: 18px; cursor: pointer; margin-top: 2px; }
      .task-info { flex: 1; min-width: 0; }
      .task-title { 
        display: block;
        font-size: 15px; 
        font-weight: 500; 
        color: #0f172a; 
        text-decoration: none;
        margin-bottom: 4px;
      }
      .task-title:hover { color: #2563eb; }
      .task-system {
        display: inline-block;
        font-size: 12px;
        color: #64748b;
        text-decoration: none;
        border-left: 3px solid;
        padding-left: 8px;
        margin-bottom: 6px;
      }
      .task-system:hover { color: #2563eb; }
      .task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .task-due { font-size: 12px; color: #64748b; }
      .task-due.overdue { color: #dc2626; font-weight: 500; }
      
      .sidebar-section {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .sidebar-section h4 { margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
      
      .system-pill {
        display: block;
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-left-width: 4px;
        border-radius: 8px;
        margin-bottom: 8px;
        text-decoration: none;
        color: #0f172a;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.15s;
      }
      .system-pill:hover { background: #f8fafc; border-color: #cbd5e1; text-decoration: none; }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .stat-card {
        text-align: center;
        padding: 16px 12px;
        background: #f8fafc;
        border-radius: 8px;
      }
      .stat-value { font-size: 28px; font-weight: 700; color: #0f172a; }
      .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
      
      .user-selector {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
      }
      .user-selector label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }
      .user-selector select {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        min-width: 150px;
        cursor: pointer;
      }
      .user-selector select:hover { border-color: #cbd5e1; }
      .user-selector select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
      
      .viewing-other-user {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .viewing-other-user span { color: #1e40af; font-size: 14px; }
      .viewing-other-user a { color: #2563eb; font-weight: 500; }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks" style="color: #0f172a;">My Tasks</a>
        <a href="/systems">Systems</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>
    
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">${isViewingOwnTasks ? 'My Tasks' : `${escapeHtml(viewUser)}'s Tasks`}</h1>
        <div class="user-selector">
          <label>View tasks for:</label>
          <select onchange="window.location.href='/my-tasks?user=' + this.value">
            ${userOptions}
          </select>
        </div>
      </div>
      
      ${!isViewingOwnTasks ? `
        <div class="viewing-other-user">
          <span>👤 Viewing tasks assigned to <strong>${escapeHtml(viewUser)}</strong></span>
          <a href="/my-tasks">← Back to my tasks</a>
        </div>
      ` : ''}
      </div>
      
      <div class="dashboard-grid">
        <div class="main-content">
          ${overdueTasks.length > 0 ? `
            <div class="task-section overdue">
              <div class="task-section-header">
                <span>⚠️</span>
                <h3>Overdue</h3>
                <span class="count">${overdueTasks.length}</span>
              </div>
              <div class="task-section-body">
                ${overdueTasks.map(t => renderTaskCard(t)).join('')}
              </div>
            </div>
          ` : ''}
          
          ${todayTasks.length > 0 ? `
            <div class="task-section today">
              <div class="task-section-header">
                <span>📅</span>
                <h3>Due Today</h3>
                <span class="count">${todayTasks.length}</span>
              </div>
              <div class="task-section-body">
                ${todayTasks.map(t => renderTaskCard(t)).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="task-section">
            <div class="task-section-header">
              <span>📋</span>
              <h3>To Do</h3>
              <span class="count">${upcomingTasks.length}</span>
            </div>
            <div class="task-section-body">
              ${upcomingTasks.map(t => renderTaskCard(t)).join('')}
            </div>
          </div>
          
          ${completedTasks.length > 0 ? `
            <div class="task-section">
              <div class="task-section-header">
                <span>✅</span>
                <h3>Completed</h3>
                <span class="count">${completedTasks.length}</span>
              </div>
              <div class="task-section-body">
                ${completedTasks.map(t => renderTaskCard(t)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="sidebar">
          <div class="sidebar-section">
            <h4>Summary</h4>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${tasks.filter(t => !t.is_completed).length}</div>
                <div class="stat-label">Open Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${completedTasks.length}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: #dc2626;">${overdueTasks.length}</div>
                <div class="stat-label">Overdue</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: #ca8a04;">${todayTasks.length}</div>
                <div class="stat-label">Due Today</div>
              </div>
            </div>
          </div>
          
          ${systems.length > 0 ? `
            <div class="sidebar-section">
              <h4>${isViewingOwnTasks ? 'My Systems' : `${escapeHtml(viewUser)}'s Systems`}</h4>
              ${systemCards}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
    
    <script>
      async function toggleTask(taskId, systemId, completed) {
        try {
          await fetch('/api/tasks/' + taskId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: completed ? 1 : 0 })
          });
          location.reload();
        } catch (e) {
          console.error('Error toggling task:', e);
        }
      }
    </script>
  </body>
  </html>
  `;
}

function historyPage(opts) {
  const { history, currentUser, admin, escapeHtml } = opts;
  
  const historyItems = (history || []).map(h => {
    const date = new Date(h.changed_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const isSystem = h.type === 'system';
    const itemName = isSystem ? (h.current_name || h.name) : (h.current_title || h.title);
    const itemLink = isSystem ? `/systems/${h.system_id}` : `/systems/${h.system_id}/tasks/${h.task_id}`;
    const typeLabel = isSystem ? 'System' : 'Task';
    const typeBadge = isSystem ? 'badge-blue' : 'badge-green';
    
    return `
      <div class="history-item">
        <div class="history-meta">
          <span class="badge ${typeBadge}">${typeLabel}</span>
          <span class="history-date">${dateStr} at ${timeStr}</span>
          <span class="history-user">by ${escapeHtml(h.changed_by || 'Unknown')}</span>
        </div>
        <div class="history-content">
          <a href="${itemLink}" class="history-name">${escapeHtml(itemName || 'Deleted')}</a>
          ${!isSystem && h.system_name ? `<span class="history-system">in ${escapeHtml(h.system_name)}</span>` : ''}
        </div>
        <div class="history-actions">
          <button class="btn btn-secondary btn-sm" onclick="viewHistoryDetail(${h.id}, '${h.type}')">View</button>
          <button class="btn btn-primary btn-sm" onclick="revertTo(${isSystem ? h.system_id : h.task_id}, ${h.id}, '${h.type}')">Revert</button>
        </div>
      </div>
    `;
  }).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Edit History - Daily Logger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}
      
      .history-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .history-item {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .history-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #64748b;
      }
      .history-content {
        flex: 1;
        min-width: 200px;
      }
      .history-name {
        font-size: 15px;
        font-weight: 600;
        color: #0f172a;
        text-decoration: none;
      }
      .history-name:hover { color: #2563eb; }
      .history-system {
        font-size: 13px;
        color: #64748b;
        margin-left: 8px;
      }
      .history-actions {
        display: flex;
        gap: 8px;
      }
      
      .modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 1000;
      }
      .modal-overlay.active { display: flex; }
      .modal-box {
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 800px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
      }
      .modal-header h2 { margin: 0; font-size: 18px; }
      .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .modal-body pre {
        background: #f8fafc;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 13px;
      }
      .detail-row {
        margin-bottom: 16px;
      }
      .detail-label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .detail-value {
        font-size: 14px;
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">My Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/systems/history" class="active">History</a>
      </div>
    </nav>
    
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">📜 Edit History</h1>
        <span style="color: #64748b; font-size: 14px;">View and revert changes to systems and tasks</span>
      </div>
      
      ${history.length > 0 ? `
        <div class="history-list">
          ${historyItems}
        </div>
      ` : `
        <div class="empty-state">
          <h3>No history yet</h3>
          <p>Changes to systems and tasks will appear here.</p>
        </div>
      `}
    </div>
    
    <div class="modal-overlay" id="detailModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>History Details</h2>
          <button class="btn btn-icon btn-secondary" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body" id="detailContent">
          <!-- Content loaded dynamically -->
        </div>
      </div>
    </div>
    
    <script>
      async function viewHistoryDetail(historyId, type) {
        var modal = document.getElementById('detailModal');
        var content = document.getElementById('detailContent');
        content.innerHTML = '<p style="color: #64748b;">Loading...</p>';
        modal.classList.add('active');
        
        try {
          var endpoint = type === 'system' 
            ? '/api/history/system/' + historyId 
            : '/api/history/task/' + historyId;
          
          var response = await fetch(endpoint);
          if (!response.ok) throw new Error('Failed to load');
          var data = await response.json();
          
          var date = new Date(data.changed_at);
          var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
          
          if (type === 'system') {
            content.innerHTML = \`
              <div class="detail-row">
                <div class="detail-label">Changed At</div>
                <div class="detail-value">\${dateStr}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Changed By</div>
                <div class="detail-value">\${data.changed_by || 'Unknown'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Name</div>
                <div class="detail-value">\${data.name || '(empty)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">\${data.description || '(empty)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Tags</div>
                <div class="detail-value">\${data.tags || '(none)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Content</div>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 4px; max-height: 300px; overflow-y: auto;">\${data.content || '<p style="color: #94a3b8;">(empty)</p>'}</div>
              </div>
            \`;
          } else {
            content.innerHTML = \`
              <div class="detail-row">
                <div class="detail-label">Changed At</div>
                <div class="detail-value">\${dateStr}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Changed By</div>
                <div class="detail-value">\${data.changed_by || 'Unknown'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Title</div>
                <div class="detail-value">\${data.title || '(empty)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">\${data.description || '(empty)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Assigned To</div>
                <div class="detail-value">\${data.assigned_to || '(unassigned)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Priority</div>
                <div class="detail-value">\${data.priority || 'medium'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">\${data.due_date || '(none)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Tags</div>
                <div class="detail-value">\${data.tags || '(none)'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Completed</div>
                <div class="detail-value">\${data.is_completed ? 'Yes' : 'No'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Content</div>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 4px; max-height: 300px; overflow-y: auto;">\${data.content || '<p style="color: #94a3b8;">(empty)</p>'}</div>
              </div>
            \`;
          }
        } catch (e) {
          console.error('Error loading history:', e);
          content.innerHTML = '<p style="color: #dc2626;">Failed to load history details</p>';
        }
      }
      
      async function revertTo(itemId, historyId, type) {
        if (!confirm('Are you sure you want to revert to this version? The current version will be saved to history first.')) return;
        
        try {
          var endpoint = type === 'system' 
            ? '/api/systems/' + itemId + '/revert/' + historyId
            : '/api/tasks/' + itemId + '/revert/' + historyId;
          
          await fetch(endpoint, { method: 'POST' });
          alert('Reverted successfully!');
          location.reload();
        } catch (e) {
          console.error('Error reverting:', e);
          alert('Failed to revert');
        }
      }
      
      function closeModal() {
        document.getElementById('detailModal').classList.remove('active');
      }
      
      document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });
    </script>
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
  uploaderPage,
  adminMissedHoursPage,
  adminBackupsPage,
  restoringBackupPage,
  restoringUploadedBackupPage,
  systemsListPage,
  systemDetailPage,
  taskDetailPage,
  historyPage,
  myTasksPage,
};
