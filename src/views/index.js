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
  
  // Sort: systems with pending (incomplete) tasks first, fully done / no tasks last
  const sortedSystems = [...(systems || [])].sort((a, b) => {
    const aPending = (a.tasks || []).filter(t => !t.is_completed).length;
    const bPending = (b.tasks || []).filter(t => !t.is_completed).length;
    if (aPending > 0 && bPending === 0) return -1;
    if (aPending === 0 && bPending > 0) return 1;
    return 0; // preserve original order within each group
  });

  const systemCards = sortedSystems.map(s => {
    const taskCount = s.tasks?.length || 0;
    const completedCount = s.tasks?.filter(t => t.is_completed).length || 0;
    const pendingCount = taskCount - completedCount;
    const hasPending = pendingCount > 0;
    const tags = s.tags ? s.tags.split(',').map(t => 
      `<span class="tag">${t.trim()}</span>`
    ).join('') : '';

    // Collect unique assignees from incomplete (TODO) tasks
    const todoAssignees = new Set();
    (s.tasks || []).forEach(t => {
      if (!t.is_completed && t.assigned_to) {
        t.assigned_to.split(',').map(a => a.trim()).filter(a => a).forEach(a => todoAssignees.add(a));
      }
    });
    const todoAvatars = [...todoAssignees].map(a =>
      `<span class="avatar" title="${a} has TODO tasks" style="font-size:11px;width:24px;height:24px;line-height:24px;">${a.charAt(0).toUpperCase()}</span>`
    ).join('');
    
    return `
      <a href="/systems/${s.id}" class="system-card" style="border-left: 4px solid ${s.color || '#3b82f6'};">
        <div class="system-card-header">
          <h3 class="system-card-title">${s.name}</h3>
          ${s.created_by ? `<span class="avatar" title="Created by ${s.created_by}">${s.created_by.charAt(0).toUpperCase()}</span>` : ''}
        </div>
        ${s.description ? `<p class="system-card-desc">${s.description}</p>` : ''}
        <div class="system-card-meta">
          <span class="badge badge-gray">${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
          ${taskCount > 0 ? `<span class="badge ${hasPending ? 'badge-red' : 'badge-green'}">${completedCount}/${taskCount} done</span>` : ''}
        </div>
        ${hasPending && todoAvatars ? `<div class="system-card-todo-assignees"><span style="font-size:11px;color:#dc2626;font-weight:600;">TODO:</span> ${todoAvatars}</div>` : ''}
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
      .system-card-todo-assignees { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
      
      /* Searchable filter dropdown */
      .searchable-filter-wrap { position: relative; min-width: 130px; }
      .searchable-filter-trigger {
        display: flex; align-items: center; gap: 6px;
        padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
        font-size: 14px; background: white; cursor: pointer; user-select: none;
      }
      .searchable-filter-trigger:hover { border-color: #cbd5e1; }
      .sf-value { flex: 1; }
      .sf-arrow { font-size: 10px; color: #94a3b8; }
      .searchable-filter-dropdown {
        display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0;
        background: white; border: 1px solid #e2e8f0; border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 50; max-height: 240px;
        overflow: hidden; flex-direction: column;
      }
      .searchable-filter-dropdown.open { display: flex; }
      .searchable-filter-search {
        padding: 8px 10px; border: none; border-bottom: 1px solid #e2e8f0;
        font-size: 13px; font-family: inherit; outline: none;
      }
      .searchable-filter-options { overflow-y: auto; max-height: 190px; }
      .searchable-filter-option {
        padding: 7px 12px; font-size: 13px; cursor: pointer; transition: background 0.1s;
      }
      .searchable-filter-option:hover { background: #f1f5f9; }
      .searchable-filter-option.active { background: #eff6ff; color: #2563eb; font-weight: 500; }
      .searchable-filter-option.hidden { display: none; }
      
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
        <a href="/my-tasks">Tasks</a>
        <a href="/systems" style="color: #0f172a;">Systems</a>
        <a href="/roadmaps">Roadmaps</a>
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
            <div class="searchable-filter-wrap" id="assignedFilterWrap">
              <div class="searchable-filter-trigger" onclick="toggleFilterSelect('assignedFilterWrap')">
                <span class="sf-value">${filterAssigned ? filterAssigned : 'All'}</span>
                <span class="sf-arrow">▼</span>
              </div>
              <div class="searchable-filter-dropdown">
                <input type="text" class="searchable-filter-search" placeholder="Search users..." oninput="filterSelectOptions(this)">
                <div class="searchable-filter-options">
                  <div class="searchable-filter-option ${!filterAssigned ? 'active' : ''}" onclick="applyAssignedFilter('')">All</div>
                  ${(users || []).map(u => 
                    '<div class="searchable-filter-option ' + (filterAssigned === u.username ? 'active' : '') + '" onclick="applyAssignedFilter(\'' + u.username + '\')">' + u.username + '</div>'
                  ).join('')}
                </div>
              </div>
            </div>
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
        const tagSelect = document.querySelector('.filter-group:last-child .form-select');
        const tag = tagSelect ? tagSelect.value : '';
        const assigned = document.querySelector('#assignedFilterWrap .searchable-filter-option.active');
        const assignedVal = assigned ? (assigned.textContent.trim() === 'All' ? '' : assigned.textContent.trim()) : '';
        const params = new URLSearchParams();
        if (assignedVal) params.set('assigned', assignedVal);
        if (tag) params.set('tag', tag);
        window.location.href = '/systems' + (params.toString() ? '?' + params.toString() : '');
      }
      
      function applyAssignedFilter(val) {
        const params = new URLSearchParams(window.location.search);
        if (val) { params.set('assigned', val); } else { params.delete('assigned'); }
        window.location.href = '/systems' + (params.toString() ? '?' + params.toString() : '');
      }
      
      function toggleFilterSelect(wrapId) {
        const wrap = document.getElementById(wrapId);
        const dd = wrap.querySelector('.searchable-filter-dropdown');
        const isOpen = dd.classList.contains('open');
        document.querySelectorAll('.searchable-filter-dropdown').forEach(d => d.classList.remove('open'));
        if (!isOpen) {
          dd.classList.add('open');
          const input = dd.querySelector('.searchable-filter-search');
          input.value = '';
          input.focus();
          dd.querySelectorAll('.searchable-filter-option').forEach(o => o.classList.remove('hidden'));
        }
      }
      
      function filterSelectOptions(input) {
        const q = input.value.toLowerCase();
        const wrap = input.closest('.searchable-filter-wrap');
        wrap.querySelectorAll('.searchable-filter-option').forEach(opt => {
          opt.classList.toggle('hidden', q && !opt.textContent.toLowerCase().includes(q));
        });
      }
      
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.searchable-filter-wrap')) {
          document.querySelectorAll('.searchable-filter-dropdown').forEach(d => d.classList.remove('open'));
        }
      });
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
      .assignee-search {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        margin-bottom: 6px;
        outline: none;
      }
      .assignee-search:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
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
        <a href="/my-tasks">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps">Roadmaps</a>
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
            <div class="rich-editor" contenteditable="true" id="systemContent" onblur="updateSystem()" oninput="autoSave()">${system.content || '<p><br></p>'}</div>
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
                <input type="text" class="assignee-search" placeholder="Search users..." oninput="filterAssigneeCheckboxes(this)">
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
      
      function filterAssigneeCheckboxes(input) {
        var q = input.value.toLowerCase();
        var wrapper = input.nextElementSibling;
        wrapper.querySelectorAll('.assignee-checkbox-label').forEach(function(label) {
          var text = label.textContent.toLowerCase();
          label.style.display = q && !text.includes(q) ? 'none' : '';
        });
      }
      
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
        var content = document.getElementById('systemContent');
        
        // Build the checklist HTML with proper paragraph after
        var html = '<div class="content-checklist" data-checklist-id="' + id + '" contenteditable="false">' +
          '<div class="content-checklist-header" onclick="toggleContentChecklist(this.parentElement)">' +
            '<span class="content-checklist-toggle">▶</span>' +
            '<input type="checkbox" class="content-checklist-checkbox" onclick="event.stopPropagation(); toggleChecklistChecked(this)">' +
            '<span class="content-checklist-title" contenteditable="true" onclick="event.stopPropagation()" onblur="triggerContentUpdate()"></span>' +
            '<button class="content-checklist-delete" onclick="event.stopPropagation(); deleteContentChecklist(this)" title="Delete">&times;</button>' +
          '</div>' +
          '<div class="content-checklist-body" contenteditable="true" onblur="triggerContentUpdate()"></div>' +
        '</div><p><br></p>';
        
        document.execCommand('insertHTML', false, html);
        
        // Ensure there's a paragraph before the checklist if it's at the start
        setTimeout(function() {
          var checklist = document.querySelector('[data-checklist-id="' + id + '"]');
          if (checklist) {
            // If checklist is the first child, add a paragraph before it
            if (checklist === content.firstElementChild) {
              var p = document.createElement('p');
              p.innerHTML = '<br>';
              content.insertBefore(p, checklist);
            }
            
            // Focus the title
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
      
      // Ensure content editor has proper structure
      (function initContentEditor() {
        var content = document.getElementById('systemContent');
        if (!content) return;
        
        // If empty or just whitespace, add initial paragraph
        if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
          content.innerHTML = '<p><br></p>';
        }
        
        // Fix first line deletion issue - ensure there's always at least one paragraph
        content.addEventListener('keydown', function(e) {
          // Ctrl+S to save
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            updateSystem();
            return;
          }
          
          // Handle backspace/delete at start of content
          if (e.key === 'Backspace' || e.key === 'Delete') {
            setTimeout(function() {
              // After deletion, ensure we still have content structure
              if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
                content.innerHTML = '<p><br></p>';
                // Place cursor in the paragraph
                var p = content.querySelector('p');
                if (p) {
                  var range = document.createRange();
                  var sel = window.getSelection();
                  range.setStart(p, 0);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }, 0);
          }
        });
        
        // Also handle when content becomes empty via other means
        content.addEventListener('input', function() {
          if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
            content.innerHTML = '<p><br></p>';
          }
        });
      })();
      
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
        max-height: 250px;
        overflow-y: auto;
      }
      .assignee-search-detail {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        margin-bottom: 6px;
        outline: none;
        box-sizing: border-box;
      }
      .assignee-search-detail:focus { border-color: #2563eb; }
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
        <a href="/my-tasks">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps">Roadmaps</a>
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
                <input type="text" class="assignee-search-detail" placeholder="Search users..." oninput="filterDetailAssignees(this)">
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
            <div class="rich-editor" contenteditable="true" id="taskContent" onblur="updateTask()" oninput="autoSave()">${task.content || '<p><br></p>'}</div>
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
        if (dropdown.style.display === 'block') {
          var searchInput = dropdown.querySelector('.assignee-search-detail');
          if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        }
      }
      
      function filterDetailAssignees(input) {
        var q = input.value.toLowerCase();
        var list = input.nextElementSibling;
        list.querySelectorAll('.assignee-checkbox-label').forEach(function(label) {
          var text = label.textContent.toLowerCase();
          label.style.display = q && !text.includes(q) ? 'none' : '';
        });
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
        var content = document.getElementById('taskContent');
        
        // Build the checklist HTML with proper paragraph after
        var html = '<div class="content-checklist" data-checklist-id="' + id + '" contenteditable="false">' +
          '<div class="content-checklist-header" onclick="toggleContentChecklist(this.parentElement)">' +
            '<span class="content-checklist-toggle">▶</span>' +
            '<input type="checkbox" class="content-checklist-checkbox" onclick="event.stopPropagation(); toggleChecklistChecked(this)">' +
            '<span class="content-checklist-title" contenteditable="true" onclick="event.stopPropagation()" onblur="triggerContentUpdate()"></span>' +
            '<button class="content-checklist-delete" onclick="event.stopPropagation(); deleteContentChecklist(this)" title="Delete">&times;</button>' +
          '</div>' +
          '<div class="content-checklist-body" contenteditable="true" onblur="triggerContentUpdate()"></div>' +
        '</div><p><br></p>';
        
        document.execCommand('insertHTML', false, html);
        
        // Ensure there's a paragraph before the checklist if it's at the start
        setTimeout(function() {
          var checklist = document.querySelector('[data-checklist-id="' + id + '"]');
          if (checklist) {
            // If checklist is the first child, add a paragraph before it
            if (checklist === content.firstElementChild) {
              var p = document.createElement('p');
              p.innerHTML = '<br>';
              content.insertBefore(p, checklist);
            }
            
            // Focus the title
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
      
      // Ensure content editor has proper structure
      (function initContentEditor() {
        var content = document.getElementById('taskContent');
        if (!content) return;
        
        // If empty or just whitespace, add initial paragraph
        if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
          content.innerHTML = '<p><br></p>';
        }
        
        // Fix first line deletion issue - ensure there's always at least one paragraph
        content.addEventListener('keydown', function(e) {
          // Ctrl+S to save
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            updateTask();
            return;
          }
          
          // Handle backspace/delete at start of content
          if (e.key === 'Backspace' || e.key === 'Delete') {
            setTimeout(function() {
              // After deletion, ensure we still have content structure
              if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
                content.innerHTML = '<p><br></p>';
                // Place cursor in the paragraph
                var p = content.querySelector('p');
                if (p) {
                  var range = document.createRange();
                  var sel = window.getSelection();
                  range.setStart(p, 0);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }, 0);
          }
        });
        
        // Also handle when content becomes empty via other means
        content.addEventListener('input', function() {
          if (!content.innerHTML.trim() || content.innerHTML.trim() === '<br>') {
            content.innerHTML = '<p><br></p>';
          }
        });
      })();
      
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
  
  // Build user options for selector - include "All" as first option
  const userOptions = `<option value="all" ${viewUser === 'all' ? 'selected' : ''}>All</option>` +
    (users || []).map(u => 
      `<option value="${u.username}" ${viewUser === u.username ? 'selected' : ''}>${u.username}</option>`
    ).join('');
  
  const isViewingAll = viewUser === 'all';
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
  
  const renderChecklistPreview = (task) => {
    const checklist = task.checklist || [];
    if (checklist.length === 0) return '';
    const completedCount = checklist.filter(c => c.is_completed).length;
    const totalCount = checklist.length;
    return `
      <div class="checklist-preview">
        <button class="checklist-toggle" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.checklist-preview').classList.toggle('open');">
          <span class="checklist-toggle-icon">▶</span>
          <span class="checklist-progress-text">Checklist ${completedCount}/${totalCount}</span>
          <div class="checklist-mini-bar">
            <div class="checklist-mini-bar-fill" style="width: ${totalCount > 0 ? (completedCount / totalCount * 100) : 0}%;"></div>
          </div>
        </button>
        <div class="checklist-dropdown">
          ${checklist.map(item => `
            <div class="checklist-preview-item ${item.is_completed ? 'completed' : ''}">
              <input type="checkbox" ${item.is_completed ? 'checked' : ''} onchange="event.stopPropagation(); toggleChecklistFromTask(${item.id}, ${task.id}, this.checked)" />
              <span>${escapeHtml(item.title)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };
  
  const renderTaskCard = (task, showSystem = true) => {
    const priorityClass = {
      low: 'badge-gray',
      medium: 'badge-blue',
      high: 'badge-yellow',
      urgent: 'badge-red'
    }[task.priority || 'medium'];
    
    const isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date();
    
    const assignedUsers = task.assigned_to ? task.assigned_to.split(',').map(a => a.trim()).filter(a => a) : [];
    const assigneeAvatars = isViewingAll && assignedUsers.length > 0 ? assignedUsers.map(a =>
      `<span class="avatar avatar-sm" title="${escapeHtml(a)}">${a.charAt(0).toUpperCase()}</span>`
    ).join('') : '';
    
    return `
      <div class="task-card ${task.is_completed ? 'completed' : ''}" data-task-id="${task.id}" data-title="${escapeHtml(task.title).toLowerCase()}" data-system="${escapeHtml(task.system_name || '').toLowerCase()}" data-priority="${task.priority || 'medium'}">
        <div class="task-checkbox">
          <input type="checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTask(${task.id}, ${task.system_id}, this.checked)">
        </div>
        <div class="task-info">
          <div class="task-title-row">
            <a href="/systems/${task.system_id}/tasks/${task.id}" class="task-title">${escapeHtml(task.title)}</a>
            ${assigneeAvatars ? `<div class="task-assignees">${assigneeAvatars}</div>` : ''}
          </div>
          ${showSystem && task.system_name ? `
            <a href="/systems/${task.system_id}" class="task-system" style="border-left-color: ${task.system_color || '#3b82f6'};">
              ${escapeHtml(task.system_name)}
            </a>
          ` : ''}
          <div class="task-meta">
            <span class="badge ${priorityClass}">${task.priority || 'medium'}</span>
            ${task.due_date ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️' : '📅'} ${task.due_date}</span>` : ''}
          </div>
          ${renderChecklistPreview(task)}
        </div>
      </div>
    `;
  };
  
  const systemCards = (systems || []).map(s => `
    <a href="/systems/${s.id}" class="system-pill" style="border-left-color: ${s.color || '#3b82f6'};">
      ${escapeHtml(s.name)}
    </a>
  `).join('');
  
  const pageTitle = isViewingAll ? 'Tasks' : (isViewingOwnTasks ? 'Tasks' : `${escapeHtml(viewUser)}'s Tasks`);
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tasks - Daily Logger</title>
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
      .task-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
      .task-title { 
        display: block;
        font-size: 15px; 
        font-weight: 500; 
        color: #0f172a; 
        text-decoration: none;
        flex: 1;
        min-width: 0;
      }
      .task-title:hover { color: #2563eb; }
      .task-assignees { display: flex; gap: 2px; flex-shrink: 0; }
      .avatar-sm { width: 22px; height: 22px; font-size: 10px; }
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
      
      /* Checklist preview styles */
      .checklist-preview { margin-top: 8px; }
      .checklist-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 12px;
        color: #475569;
        font-family: inherit;
        transition: all 0.15s;
        width: 100%;
      }
      .checklist-toggle:hover { background: #e2e8f0; }
      .checklist-toggle-icon {
        font-size: 9px;
        transition: transform 0.2s;
        display: inline-block;
      }
      .checklist-preview.open .checklist-toggle-icon { transform: rotate(90deg); }
      .checklist-progress-text { flex-shrink: 0; font-weight: 500; }
      .checklist-mini-bar {
        flex: 1;
        height: 5px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
        min-width: 40px;
      }
      .checklist-mini-bar-fill {
        height: 100%;
        background: #22c55e;
        border-radius: 999px;
        transition: width 0.3s;
      }
      .checklist-dropdown {
        display: none;
        margin-top: 6px;
        padding: 6px 0;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: white;
      }
      .checklist-preview.open .checklist-dropdown { display: block; }
      .checklist-preview-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        font-size: 13px;
        color: #334155;
      }
      .checklist-preview-item.completed span { text-decoration: line-through; color: #94a3b8; }
      .checklist-preview-item input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }
      
      /* Task search bar */
      .task-search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .task-search-input {
        flex: 1;
        min-width: 200px;
        padding: 10px 14px 10px 36px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E") no-repeat 12px center;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .task-search-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      .task-search-count {
        font-size: 13px;
        color: #94a3b8;
        white-space: nowrap;
      }
      
      /* Searchable user selector */
      .searchable-select-wrap {
        position: relative;
        min-width: 170px;
      }
      .searchable-select-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        user-select: none;
        transition: border-color 0.15s;
      }
      .searchable-select-trigger:hover { border-color: #cbd5e1; }
      .searchable-select-trigger .ss-value { flex: 1; }
      .searchable-select-trigger .ss-arrow { font-size: 10px; color: #94a3b8; }
      .searchable-select-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        z-index: 50;
        max-height: 260px;
        overflow: hidden;
        flex-direction: column;
      }
      .searchable-select-dropdown.open { display: flex; }
      .searchable-select-search {
        padding: 8px 10px;
        border: none;
        border-bottom: 1px solid #e2e8f0;
        font-size: 13px;
        font-family: inherit;
        outline: none;
      }
      .searchable-select-options {
        overflow-y: auto;
        max-height: 200px;
      }
      .searchable-select-option {
        padding: 8px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.1s;
      }
      .searchable-select-option:hover { background: #f1f5f9; }
      .searchable-select-option.active { background: #eff6ff; color: #2563eb; font-weight: 500; }
      .searchable-select-option.hidden { display: none; }
      
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
        <a href="/my-tasks" style="color: #0f172a;">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps">Roadmaps</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>
    
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">${pageTitle}</h1>
        <div class="user-selector">
          <label>View tasks for:</label>
          <div class="searchable-select-wrap" id="userSelectWrap">
            <div class="searchable-select-trigger" onclick="toggleSearchableSelect('userSelectWrap')">
              <span class="ss-value">${isViewingAll ? 'All' : escapeHtml(viewUser)}</span>
              <span class="ss-arrow">▼</span>
            </div>
            <div class="searchable-select-dropdown" id="userSelectDropdown">
              <input type="text" class="searchable-select-search" placeholder="Search users..." oninput="filterSearchableOptions(this, 'userSelectWrap')">
              <div class="searchable-select-options">
                <div class="searchable-select-option ${isViewingAll ? 'active' : ''}" data-value="all" onclick="selectSearchableOption('/my-tasks?user=all')">All</div>
                ${(users || []).map(u => `
                  <div class="searchable-select-option ${viewUser === u.username ? 'active' : ''}" data-value="${u.username}" onclick="selectSearchableOption('/my-tasks?user=${encodeURIComponent(u.username)}')">
                    ${escapeHtml(u.username)}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${!isViewingAll && !isViewingOwnTasks ? `
        <div class="viewing-other-user">
          <span>👤 Viewing tasks assigned to <strong>${escapeHtml(viewUser)}</strong></span>
          <a href="/my-tasks">← Back to all tasks</a>
        </div>
      ` : ''}
      
      <div class="task-search-bar">
        <input type="text" class="task-search-input" id="taskSearchInput" placeholder="Search tasks by title, system, or priority..." oninput="filterTasks()">
        <span class="task-search-count" id="taskSearchCount"></span>
      </div>
      
      <div class="dashboard-grid">
        <div class="main-content" id="tasksContainer">
          ${overdueTasks.length > 0 ? `
            <div class="task-section overdue" data-section="overdue">
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
            <div class="task-section today" data-section="today">
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
          
          <div class="task-section" data-section="todo">
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
            <div class="task-section" data-section="completed">
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
              <h4>${isViewingAll ? 'Systems' : (isViewingOwnTasks ? 'My Systems' : `${escapeHtml(viewUser)}'s Systems`)}</h4>
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
      
      async function toggleChecklistFromTask(itemId, taskId, completed) {
        try {
          await fetch('/api/checklist/' + itemId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: completed ? 1 : 0 })
          });
          // Update UI inline
          const item = event.target.closest('.checklist-preview-item');
          if (completed) {
            item.classList.add('completed');
          } else {
            item.classList.remove('completed');
          }
          // Update the progress bar and text
          const preview = event.target.closest('.checklist-preview');
          const items = preview.querySelectorAll('.checklist-preview-item');
          const doneCount = preview.querySelectorAll('.checklist-preview-item.completed').length;
          const totalCount = items.length;
          preview.querySelector('.checklist-progress-text').textContent = 'Checklist ' + doneCount + '/' + totalCount;
          preview.querySelector('.checklist-mini-bar-fill').style.width = (totalCount > 0 ? (doneCount / totalCount * 100) : 0) + '%';
        } catch (e) {
          console.error('Error toggling checklist item:', e);
          location.reload();
        }
      }
      
      // Task search
      function filterTasks() {
        const query = document.getElementById('taskSearchInput').value.toLowerCase().trim();
        const cards = document.querySelectorAll('.task-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          const title = card.getAttribute('data-title') || '';
          const system = card.getAttribute('data-system') || '';
          const priority = card.getAttribute('data-priority') || '';
          const matches = !query || title.includes(query) || system.includes(query) || priority.includes(query);
          card.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });
        
        // Update section counts
        document.querySelectorAll('.task-section').forEach(section => {
          const visibleInSection = section.querySelectorAll('.task-card:not([style*="display: none"])').length;
          const countEl = section.querySelector('.count');
          if (countEl) countEl.textContent = visibleInSection;
          // Hide section if no visible cards
          if (query && visibleInSection === 0) {
            section.style.display = 'none';
          } else {
            section.style.display = '';
          }
        });
        
        const countEl = document.getElementById('taskSearchCount');
        if (query) {
          countEl.textContent = visibleCount + ' result' + (visibleCount !== 1 ? 's' : '');
        } else {
          countEl.textContent = '';
        }
      }
      
      // Searchable select
      function toggleSearchableSelect(wrapId) {
        const wrap = document.getElementById(wrapId);
        const dd = wrap.querySelector('.searchable-select-dropdown');
        const isOpen = dd.classList.contains('open');
        // Close all
        document.querySelectorAll('.searchable-select-dropdown').forEach(d => d.classList.remove('open'));
        if (!isOpen) {
          dd.classList.add('open');
          const searchInput = dd.querySelector('.searchable-select-search');
          searchInput.value = '';
          searchInput.focus();
          // Reset filter
          dd.querySelectorAll('.searchable-select-option').forEach(o => o.classList.remove('hidden'));
        }
      }
      
      function filterSearchableOptions(input, wrapId) {
        const query = input.value.toLowerCase();
        const wrap = document.getElementById(wrapId);
        wrap.querySelectorAll('.searchable-select-option').forEach(opt => {
          const text = opt.textContent.toLowerCase();
          opt.classList.toggle('hidden', query && !text.includes(query));
        });
      }
      
      function selectSearchableOption(url) {
        window.location.href = url;
      }
      
      // Close dropdowns on outside click
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.searchable-select-wrap')) {
          document.querySelectorAll('.searchable-select-dropdown').forEach(d => d.classList.remove('open'));
        }
      });
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
        <a href="/my-tasks">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps">Roadmaps</a>
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

// ======================== ROADMAP VIEWS ========================

function roadmapsListPage(opts) {
  const { roadmaps, currentUser, admin } = opts;

  const cards = roadmaps.map(rm => {
    const pct = rm.totalMilestones > 0 ? Math.round((rm.completedMilestones / rm.totalMilestones) * 100) : 0;
    return `
      <a href="/roadmaps/${rm.id}" class="roadmap-card" style="border-left: 4px solid ${rm.color || '#2563eb'};">
        <div class="roadmap-card-header">
          <h3 class="roadmap-card-title">${rm.name}</h3>
          <span class="badge ${pct === 100 ? 'badge-green' : pct > 0 ? 'badge-blue' : 'badge-gray'}">${pct}%</span>
        </div>
        ${rm.description ? `<p class="roadmap-card-desc">${rm.description}</p>` : ''}
        <div class="roadmap-card-meta">
          <span>${rm.totalMilestones} milestone${rm.totalMilestones !== 1 ? 's' : ''}</span>
          <span>${rm.completedMilestones} done</span>
          ${rm.inProgressMilestones > 0 ? `<span class="badge badge-yellow" style="font-size:10px;">${rm.inProgressMilestones} active</span>` : ''}
        </div>
      </a>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Roadmaps - Daily Logger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}

      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
      }
      .roadmap-card {
        display: block;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px 24px;
        text-decoration: none !important;
        transition: box-shadow 0.15s, border-color 0.15s;
      }
      .roadmap-card:hover {
        box-shadow: 0 4px 16px rgba(15,23,42,0.08);
        border-color: #cbd5e1;
      }
      .roadmap-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .roadmap-card-title { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
      .roadmap-card-desc { margin: 8px 0 0; font-size: 14px; color: #64748b; line-height: 1.5; }
      .roadmap-card-meta { margin-top: 14px; display: flex; gap: 14px; font-size: 13px; color: #94a3b8; }

      /* Modal */
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(15,23,42,0.35);
        display: none; align-items: center; justify-content: center; z-index: 9999; padding: 16px;
      }
      .modal-overlay.active { display: flex; }
      .modal-card {
        background: white; border-radius: 16px; border: 1px solid #e2e8f0;
        box-shadow: 0 10px 30px rgba(15,23,42,0.18); width: 100%; max-width: 500px; padding: 24px;
      }
      .modal-title { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
      .color-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
      .color-swatch {
        width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent;
        cursor: pointer; transition: border-color 0.15s;
      }
      .color-swatch.active, .color-swatch:hover { border-color: #0f172a; }
      .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps" style="color:#0f172a;">Roadmaps</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Roadmaps</h1>
        <button class="btn btn-primary" onclick="document.getElementById('newRoadmapModal').classList.add('active')">
          + New Roadmap
        </button>
      </div>

      ${roadmaps.length === 0 ? `
        <div class="empty-state">
          <h3>No roadmaps yet</h3>
          <p>Create your first timeline roadmap to visualize goals and milestones.</p>
          <button class="btn btn-primary" onclick="document.getElementById('newRoadmapModal').classList.add('active')">Create Roadmap</button>
        </div>
      ` : `
        <div class="roadmap-grid">${cards}</div>
      `}
    </div>

    <!-- New Roadmap Modal -->
    <div class="modal-overlay" id="newRoadmapModal">
      <div class="modal-card">
        <h2 class="modal-title">New Roadmap</h2>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="rmName" placeholder="Q1 Product Roadmap" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="rmDesc" rows="3" placeholder="Brief overview of this roadmap…" style="resize:vertical;min-height:80px;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-swatches" id="rmColors">
            <div class="color-swatch active" data-color="#2563eb" style="background:#2563eb;"></div>
            <div class="color-swatch" data-color="#7c3aed" style="background:#7c3aed;"></div>
            <div class="color-swatch" data-color="#db2777" style="background:#db2777;"></div>
            <div class="color-swatch" data-color="#dc2626" style="background:#dc2626;"></div>
            <div class="color-swatch" data-color="#ea580c" style="background:#ea580c;"></div>
            <div class="color-swatch" data-color="#ca8a04" style="background:#ca8a04;"></div>
            <div class="color-swatch" data-color="#16a34a" style="background:#16a34a;"></div>
            <div class="color-swatch" data-color="#0891b2" style="background:#0891b2;"></div>
            <div class="color-swatch" data-color="#64748b" style="background:#64748b;"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="document.getElementById('newRoadmapModal').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" onclick="createRoadmap()">Create Roadmap</button>
        </div>
      </div>
    </div>

    <script>
      let selectedColor = '#2563eb';
      document.querySelectorAll('#rmColors .color-swatch').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('#rmColors .color-swatch').forEach(s => s.classList.remove('active'));
          el.classList.add('active');
          selectedColor = el.dataset.color;
        });
      });
      document.getElementById('newRoadmapModal').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
      });

      async function createRoadmap() {
        const name = document.getElementById('rmName').value.trim();
        const description = document.getElementById('rmDesc').value.trim();
        if (!name) return alert('Name is required');
        const res = await fetch('/api/roadmaps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color: selectedColor })
        });
        const data = await res.json();
        if (data.success) window.location.href = '/roadmaps/' + data.id;
        else alert(data.error || 'Failed to create roadmap');
      }
    </script>
  </body>
  </html>
  `;
}

function roadmapDetailPage(opts) {
  const { roadmap, milestones, systems, tasks, allRoadmaps, currentUser, admin, escapeHtml } = opts;

  const milestoneDataJson = JSON.stringify(milestones.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description || '',
    content: m.content || '',
    due_date: m.due_date || '',
    status: m.status || 'not-started',
    color: m.color || roadmap.color || '#2563eb',
    position: m.position,
    task_id: m.task_id,
    system_id: m.system_id,
    google_docs_url: m.google_docs_url || '',
    attachments: (m.attachments || []).map(a => ({ id: a.id, original_name: a.original_name, filename: a.filename, mime_type: a.mime_type, size: a.size })),
    linkedTask: m.linkedTask ? { id: m.linkedTask.id, title: m.linkedTask.title, system_name: m.linkedTask.system_name, is_completed: m.linkedTask.is_completed, assigned_to: m.linkedTask.assigned_to || '' } : null,
    completed_at: m.completed_at || '',
    steps: (m.steps || []).map(s => ({ id: s.id, title: s.title, description: s.description || '', duration_days: s.duration_days || 1, status: s.status || 'not-started', position: s.position, task_id: s.task_id, start_date: s.start_date || '', end_date: s.end_date || '', completed_at: s.completed_at || '', linkedTasks: (s.linkedTasks || []).map(lt => ({ task_id: lt.task_id, title: lt.title, is_completed: lt.is_completed, assigned_to: lt.assigned_to || '', priority: lt.priority || 'medium', system_name: lt.system_name || '', system_id: lt.system_id, system_color: lt.system_color || '#94a3b8', due_date: lt.due_date || '' })) })),
  })));

  const tasksJson = JSON.stringify(tasks.map(t => ({
    id: t.id, title: t.title, system_id: t.system_id, system_name: t.system_name || '',
    is_completed: t.is_completed, priority: t.priority || 'medium',
    due_date: t.due_date || '', tags: t.tags || '', assigned_to: t.assigned_to || '',
  })));

  const systemsJson = JSON.stringify(systems.map(s => ({ id: s.id, name: s.name, color: s.color || '#3b82f6' })));

  const switcherOptions = allRoadmaps.map(rm =>
    `<option value="${rm.id}" ${rm.id === roadmap.id ? 'selected' : ''} style="color:${rm.color}">${escapeHtml(rm.name)}</option>`
  ).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${escapeHtml(roadmap.name)} - Roadmap - Daily Logger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      ${systemsBaseCss()}

      /* ── Roadmap Switcher ── */
      .roadmap-switcher {
        display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
      }
      .roadmap-switcher select {
        padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
        font-size: 14px; font-family: inherit; background: white; cursor: pointer;
      }
      .roadmap-meta { font-size: 13px; color: #64748b; margin-bottom: 24px; }

      /* ── Timeline ── */
      .timeline-wrapper {
        position: relative;
        overflow-x: auto;
        padding: 40px 0 60px;
        -webkit-overflow-scrolling: touch;
      }
      .timeline-track {
        position: relative;
        min-height: 320px;
        padding: 0 60px;
      }
      .timeline-line {
        position: absolute;
        top: 130px;
        left: 40px;
        right: 40px;
        height: 4px;
        background: linear-gradient(90deg, ${roadmap.color || '#2563eb'}22, ${roadmap.color || '#2563eb'}66, ${roadmap.color || '#2563eb'}22);
        border-radius: 2px;
        z-index: 1;
      }
      .timeline-progress {
        position: absolute;
        top: 0; left: 0; height: 100%;
        background: ${roadmap.color || '#2563eb'};
        border-radius: 2px;
        transition: width 0.4s ease;
      }

      .timeline-milestones {
        position: relative;
        display: flex;
        gap: 0;
        z-index: 2;
        min-width: max-content;
      }

      .milestone-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 200px;
        max-width: 260px;
        flex: 1;
        position: relative;
        cursor: pointer;
        transition: transform 0.15s;
      }
      .milestone-slot:hover { transform: translateY(-4px); }
      .milestone-slot.ms-dragging { opacity: 0.4; }
      .milestone-slot.ms-drag-over .milestone-card { border-color: #2563eb; box-shadow: 0 0 0 2px #2563eb44; }

      .milestone-card {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px 16px;
        width: 200px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(15,23,42,0.06);
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .milestone-slot:hover .milestone-card {
        box-shadow: 0 6px 20px rgba(15,23,42,0.12);
      }
      .milestone-card.status-completed { border-color: #16a34a; }
      .milestone-card.status-in-progress { border-color: #2563eb; }

      .milestone-title {
        font-size: 14px; font-weight: 700; color: #0f172a;
        margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .milestone-date { font-size: 12px; color: #94a3b8; margin: 0 0 8px; }
      .milestone-status {
        display: inline-block; padding: 2px 8px; border-radius: 9999px;
        font-size: 11px; font-weight: 600;
      }
      .milestone-extras {
        display: flex; gap: 6px; justify-content: center; margin-top: 8px; flex-wrap: wrap;
      }
      .milestone-extras .me-icon {
        font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 3px;
      }

      /* Steps mini-bar on milestone card */
      .ms-steps-bar {
        display: flex; gap: 2px; margin-top: 10px; height: 4px; border-radius: 2px; overflow: hidden;
        background: #f1f5f9;
      }
      .ms-steps-bar .sb-seg {
        flex: 1; border-radius: 2px; transition: background 0.2s;
      }
      .sb-seg.sb-done { background: #16a34a; }
      .sb-seg.sb-active { background: #2563eb; }
      .sb-seg.sb-pending { background: #e2e8f0; }
      .ms-steps-label {
        font-size: 10px; color: #94a3b8; margin-top: 4px; font-weight: 500;
      }

      /* Connector dot */
      .milestone-connector {
        width: 18px; height: 18px; border-radius: 50%;
        border: 3px solid white; box-shadow: 0 0 0 2px #e2e8f0;
        margin: 12px 0; z-index: 3; transition: transform 0.15s;
      }
      .milestone-slot:hover .milestone-connector { transform: scale(1.3); }
      .milestone-connector.status-completed { background: #16a34a; box-shadow: 0 0 0 2px #16a34a; }
      .milestone-connector.status-in-progress { background: #2563eb; box-shadow: 0 0 0 2px #2563eb; }
      .milestone-connector.status-not-started { background: #e2e8f0; box-shadow: 0 0 0 2px #cbd5e1; }

      .milestone-due-label {
        font-size: 12px; color: #64748b; font-weight: 500; text-align: center;
        margin-top: 4px; white-space: nowrap;
      }

      /* ── Detail Panel ── */
      .detail-overlay {
        position: fixed; inset: 0; background: rgba(15,23,42,0.35);
        display: none; z-index: 10000;
      }
      .detail-overlay.active { display: block; }
      .detail-panel {
        position: fixed; top: 0; right: -600px; width: 600px; max-width: 100vw;
        height: 100vh; background: #f8fafc;
        box-shadow: -4px 0 24px rgba(15,23,42,0.12);
        transition: right 0.3s ease; z-index: 10001;
        display: flex; flex-direction: column;
      }
      .detail-overlay.active .detail-panel { right: 0; }
      .detail-panel-header {
        padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
        display: flex; align-items: center; justify-content: space-between;
        background: white;
      }
      .detail-panel-body { padding: 0; flex: 1; overflow-y: auto; }
      .detail-panel-footer {
        padding: 16px 24px; border-top: 1px solid #e2e8f0;
        display: flex; gap: 10px; justify-content: flex-end; background: white;
      }

      /* Detail sections as cards */
      .detail-card {
        background: white; border-radius: 12px; border: 1px solid #e2e8f0;
        margin: 16px; padding: 20px;
        box-shadow: 0 1px 3px rgba(15,23,42,0.04);
      }
      .detail-card-title {
        font-size: 12px; font-weight: 700; color: #475569;
        text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
        display: flex; align-items: center; gap: 8px;
      }
      .detail-card-title .dct-badge {
        font-size: 10px; padding: 2px 8px; border-radius: 9999px;
        font-weight: 600; background: #f1f5f9; color: #64748b;
      }

      /* ── Sub-Timeline (Steps) ── */
      .steps-timeline {
        position: relative; padding: 0;
      }
      .steps-progress-bar {
        display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
      }
      .steps-progress-track {
        flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;
      }
      .steps-progress-fill {
        height: 100%; border-radius: 3px; transition: width 0.3s ease;
        background: linear-gradient(90deg, #16a34a, #22c55e);
      }
      .steps-progress-text {
        font-size: 12px; font-weight: 600; color: #475569; white-space: nowrap;
      }
      .steps-total-duration {
        font-size: 12px; color: #94a3b8; margin-bottom: 16px;
      }

      .step-item {
        display: flex; align-items: stretch; gap: 0; position: relative;
        margin-bottom: 0; transition: opacity 0.15s;
      }
      .step-item.step-dragging { opacity: 0.3; }
      .step-item.step-drag-over::before {
        content: ''; position: absolute; top: -2px; left: 0; right: 0;
        height: 3px; background: #2563eb; border-radius: 2px; z-index: 5;
      }

      /* Left connector column */
      .step-connector-col {
        display: flex; flex-direction: column; align-items: center;
        width: 32px; flex-shrink: 0; position: relative;
      }
      .step-dot {
        width: 14px; height: 14px; border-radius: 50%;
        border: 2.5px solid #e2e8f0; background: white;
        z-index: 2; flex-shrink: 0; margin-top: 18px;
        transition: all 0.15s;
      }
      .step-dot.dot-completed { background: #16a34a; border-color: #16a34a; }
      .step-dot.dot-in-progress { background: #2563eb; border-color: #2563eb; box-shadow: 0 0 0 3px #2563eb33; }
      .step-dot.dot-not-started { background: white; border-color: #cbd5e1; }
      .step-line {
        width: 2px; flex: 1; background: #e2e8f0; min-height: 8px;
      }
      .step-line.line-done { background: #16a34a; }
      .step-item:last-child .step-line { display: none; }

      /* Right content */
      .step-content {
        flex: 1; display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; margin: 4px 0;
        border-radius: 10px; border: 1px solid transparent;
        transition: background 0.1s, border-color 0.1s;
        cursor: default; min-height: 48px;
      }
      .step-content:hover { background: #f1f5f9; border-color: #e2e8f0; }

      .step-drag-handle {
        cursor: grab; color: #cbd5e1; font-size: 16px; line-height: 1;
        padding: 4px 2px; user-select: none; flex-shrink: 0;
        transition: color 0.1s;
      }
      .step-drag-handle:hover { color: #64748b; }
      .step-drag-handle:active { cursor: grabbing; }

      .step-info { flex: 1; min-width: 0; }
      .step-title-row { display: flex; align-items: center; gap: 8px; }
      .step-title {
        font-size: 14px; font-weight: 600; color: #0f172a;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .step-title.s-done { text-decoration: line-through; color: #94a3b8; }
      .step-desc {
        font-size: 12px; color: #94a3b8; margin-top: 2px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .step-duration {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 9999px; font-size: 11px;
        font-weight: 600; white-space: nowrap; flex-shrink: 0;
        background: #f1f5f9; color: #475569;
      }
      .step-duration .sd-icon { font-size: 12px; }
      .step-duration .sd-dates { color: #1e293b; }
      .step-duration .sd-days { color: #94a3b8; font-weight: 500; }

      .step-status-btn {
        width: 28px; height: 28px; border-radius: 8px; border: 2px solid #e2e8f0;
        background: white; display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px; flex-shrink: 0; transition: all 0.15s;
        color: transparent;
      }
      .step-status-btn:hover { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
      .step-status-btn.ssb-done { background: #16a34a; border-color: #16a34a; color: white; }
      .step-status-btn.ssb-progress { background: #dbeafe; border-color: #2563eb; color: #2563eb; }

      .step-actions {
        display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; flex-shrink: 0;
      }
      .step-content:hover .step-actions { opacity: 1; }
      .step-action-btn {
        border: none; background: none; cursor: pointer; font-size: 14px; color: #94a3b8;
        padding: 4px; border-radius: 4px; transition: color 0.1s, background 0.1s;
      }
      .step-action-btn:hover { color: #475569; background: #e2e8f0; }
      .step-action-btn.sa-delete:hover { color: #dc2626; background: #fee2e2; }

      /* Add step row */
      .add-step-row {
        display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-left: 32px;
      }
      .add-step-input {
        flex: 1; padding: 8px 12px; border: 1px dashed #cbd5e1; border-radius: 8px;
        font-size: 13px; font-family: inherit; background: white; outline: none;
        transition: border-color 0.15s;
      }
      .add-step-input:focus { border-color: #2563eb; border-style: solid; }
      .add-step-input::placeholder { color: #cbd5e1; }

      /* Template strip */
      .template-strip {
        display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-left: 32px;
      }
      .template-btn {
        padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
        border: 1px solid #e2e8f0; background: white; color: #475569;
        cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 5px;
      }
      .template-btn:hover { background: #f1f5f9; border-color: #2563eb; color: #2563eb; }

      /* ── Finalization ── */
      .finalize-section {
        margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;
      }
      .finalize-options {
        display: flex; gap: 8px; flex-wrap: wrap;
      }
      .finalize-btn {
        padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
        border: 1.5px solid transparent; cursor: pointer; transition: all 0.15s;
        display: flex; align-items: center; gap: 6px;
      }
      .finalize-btn.fb-complete {
        background: #16a34a; color: white; border-color: #16a34a;
      }
      .finalize-btn.fb-complete:hover { background: #15803d; }
      .finalize-btn.fb-review {
        background: white; color: #2563eb; border-color: #2563eb;
      }
      .finalize-btn.fb-review:hover { background: #eff6ff; }
      .finalize-btn.fb-archive {
        background: white; color: #475569; border-color: #e2e8f0;
      }
      .finalize-btn.fb-archive:hover { background: #f1f5f9; }
      .finalize-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Existing detail styles */
      .linked-task-pill {
        display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
        background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #1e293b;
        border: 1px solid #e2e8f0; cursor: pointer; transition: background 0.15s;
      }
      .linked-task-pill:hover { background: #e2e8f0; }
      .linked-task-pill .lt-system { font-size: 11px; color: #64748b; }
      .attachment-item {
        display: flex; align-items: center; gap: 10px; padding: 8px 12px;
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px;
      }
      .attachment-item .att-name { flex: 1; font-size: 13px; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-decoration: none; }
      .attachment-item .att-name:hover { color: #2563eb; }
      .attachment-item .att-size { font-size: 11px; color: #94a3b8; white-space: nowrap; }
      .attachment-item .att-remove { cursor: pointer; color: #dc2626; font-size: 13px; border: none; background: none; padding: 4px; }
      .gdocs-link {
        display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
        background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
        color: #1d4ed8; font-size: 13px; font-weight: 500; text-decoration: none;
      }
      .gdocs-link:hover { background: #dbeafe; }
      .media-preview {
        width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px;
        margin-top: 8px; background: #f1f5f9;
      }

      /* ── Modal ── */
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(15,23,42,0.35);
        display: none; align-items: center; justify-content: center; z-index: 9999; padding: 16px;
      }
      .modal-overlay.active { display: flex; }
      .modal-card {
        background: white; border-radius: 16px; border: 1px solid #e2e8f0;
        box-shadow: 0 10px 30px rgba(15,23,42,0.18); width: 100%; max-width: 560px;
        padding: 24px; max-height: 90vh; overflow-y: auto;
      }
      .modal-title { margin: 0 0 16px; font-size: 18px; font-weight: 700; }
      .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
      .color-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
      .color-swatch {
        width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent;
        cursor: pointer; transition: border-color 0.15s;
      }
      .color-swatch.active, .color-swatch:hover { border-color: #0f172a; }

      .task-picker { max-height: 420px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: white; scroll-behavior: smooth; }
      .task-picker::-webkit-scrollbar { width: 6px; }
      .task-picker::-webkit-scrollbar-track { background: #f8fafc; border-radius: 0 8px 8px 0; }
      .task-picker::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      .task-picker::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      .task-picker-system-group { border-bottom: 1px solid #e2e8f0; }
      .task-picker-system-group:last-child { border-bottom: none; }
      .task-picker-system-header {
        display: flex; align-items: center; gap: 8px; padding: 8px 12px;
        background: #f8fafc; font-size: 12px; font-weight: 700; color: #475569;
        text-transform: uppercase; letter-spacing: 0.03em;
        position: sticky; top: 0; z-index: 1; border-bottom: 1px solid #f1f5f9;
      }
      .task-picker-system-header .tp-sys-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
      .task-picker-system-header .tp-sys-count {
        margin-left: auto; font-size: 11px; font-weight: 500; color: #94a3b8;
        background: #e2e8f0; padding: 1px 7px; border-radius: 9999px;
      }
      .task-picker-item {
        padding: 9px 12px 9px 30px; cursor: pointer; display: flex; align-items: center; gap: 8px;
        font-size: 13px; border-bottom: 1px solid #f8fafc; transition: background 0.1s;
      }
      .task-picker-item:last-child { border-bottom: none; }
      .task-picker-item:hover { background: #f1f5f9; }
      .task-picker-item.selected { background: #eff6ff; border-left: 3px solid #2563eb; padding-left: 27px; }
      .task-picker-item .tp-check {
        width: 16px; height: 16px; border-radius: 4px; border: 2px solid #cbd5e1;
        display: flex; align-items: center; justify-content: center; font-size: 10px;
        flex-shrink: 0; color: white;
      }
      .task-picker-item .tp-check.done { background: #16a34a; border-color: #16a34a; }
      .task-picker-item .tp-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1e293b; }
      .task-picker-item .tp-title.done { text-decoration: line-through; color: #94a3b8; }
      .task-picker-item .tp-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .task-picker-item .tp-priority {
        font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px;
        text-transform: uppercase; letter-spacing: 0.02em;
      }
      .tp-priority.tp-p-high { background: #fee2e2; color: #dc2626; }
      .tp-priority.tp-p-urgent { background: #fecaca; color: #991b1b; }
      .tp-priority.tp-p-medium { background: #fef9c3; color: #ca8a04; }
      .tp-priority.tp-p-low { background: #f1f5f9; color: #64748b; }
      .task-picker-item .tp-due { font-size: 11px; color: #94a3b8; white-space: nowrap; }
      .task-picker-item .tp-assigned { display: flex; align-items: center; gap: 2px; margin-left: 4px; }
      .task-picker-item .tp-assigned .tp-avatar {
        width: 20px; height: 20px; border-radius: 50%; background: #e2e8f0;
        display: flex; align-items: center; justify-content: center;
        font-size: 9px; font-weight: 700; color: #64748b;
        border: 1.5px solid white; margin-left: -6px; flex-shrink: 0;
      }
      .task-picker-item .tp-assigned .tp-avatar:first-child { margin-left: 0; }
      .task-picker-item .tp-assigned .tp-avatar-more { font-size: 8px; background: #f1f5f9; color: #94a3b8; }
      .task-picker-search {
        width: 100%; padding: 10px 12px 10px 34px; border: none; border-bottom: 1px solid #e2e8f0;
        font-size: 13px; font-family: inherit; outline: none; background: white;
        border-radius: 8px 8px 0 0;
      }
      .task-picker-search-wrap { position: relative; }
      .task-picker-search-wrap::before {
        content: '🔍'; position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
        font-size: 14px; pointer-events: none; opacity: 0.4;
      }
      .task-picker-empty { padding: 20px 12px; text-align: center; color: #94a3b8; font-size: 13px; }
      .task-picker-clear {
        position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
        border: none; background: none; font-size: 16px; color: #94a3b8; cursor: pointer; padding: 4px; line-height: 1;
      }
      .task-picker-clear:hover { color: #475569; }

      /* ── Empty timeline ── */
      .timeline-empty { text-align: center; padding: 60px 24px; color: #64748b; }
      .timeline-empty h3 { color: #475569; margin: 0 0 8px; }
      .timeline-empty p { margin: 0 0 16px; font-size: 14px; }

      /* ── Finalize review modal ── */
      .finalize-modal-body { padding: 16px 0; }
      .finalize-summary { display: flex; gap: 16px; margin-bottom: 16px; }
      .finalize-stat {
        flex: 1; padding: 16px; border-radius: 12px; text-align: center;
        background: #f8fafc; border: 1px solid #e2e8f0;
      }
      .finalize-stat .fs-val { font-size: 28px; font-weight: 800; color: #0f172a; }
      .finalize-stat .fs-label { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; font-weight: 600; }

      /* Inline step editing */
      .step-edit-overlay {
        position: fixed; inset: 0; background: rgba(15,23,42,0.2); z-index: 10010; display: none;
        align-items: center; justify-content: center;
      }
      .step-edit-overlay.active { display: flex; }
      .step-edit-card {
        background: white; border-radius: 12px; border: 1px solid #e2e8f0;
        box-shadow: 0 8px 24px rgba(15,23,42,0.15); width: 100%; max-width: 420px;
        padding: 20px; margin: 16px; max-height: 85vh; overflow-y: auto;
      }

      /* Step task picker - multi-select */
      .se-task-section { margin-top: 4px; }
      .se-task-section .form-label { margin-bottom: 6px; }
      .se-task-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
      .se-task-tag {
        display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px;
        background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
        font-size: 12px; color: #1e40af;
      }
      .se-task-tag .se-tag-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .se-task-tag .se-tag-remove {
        border: none; background: none; cursor: pointer; color: #dc2626; font-size: 12px;
        padding: 0 2px; line-height: 1;
      }
      .se-task-tag .se-tag-remove:hover { color: #991b1b; }
      .se-task-picker-wrap {
        border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-height: 180px;
        display: flex; flex-direction: column;
      }
      .se-task-picker-wrap .task-picker-search { border-radius: 0; }
      .se-task-picker-list { overflow-y: auto; max-height: 140px; }

      /* Linked task pills on step items */
      .step-linked-tasks { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .step-linked-task {
        display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px;
        background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
        font-size: 11px; color: #1e40af; max-width: 100%; overflow: hidden;
        cursor: pointer; transition: background 0.15s;
      }
      .step-linked-task:hover { background: #dbeafe; }
      .step-linked-task .slt-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .step-linked-task .slt-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .step-linked-task .slt-check { flex-shrink: 0; font-size: 10px; }
      .step-linked-task .slt-assigned {
        display: inline-flex; align-items: center; gap: 1px; margin-left: 2px;
      }
      .step-linked-task .slt-avatar {
        width: 14px; height: 14px; border-radius: 50%; background: #dbeafe;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 7px; font-weight: 700; color: #1e40af;
        border: 1px solid white; margin-left: -3px; flex-shrink: 0;
      }
      .step-linked-task .slt-avatar:first-child { margin-left: 0; }
      .step-linked-task .slt-due {
        font-size: 9px; color: #64748b; margin-left: 2px; white-space: nowrap; opacity: .8;
      }
      .step-linked-task .slt-due.slt-overdue {
        color: #dc2626; font-weight: 600; opacity: 1;
      }
      .step-linked-task.slt-done { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
      .step-linked-task.slt-done .slt-due { color: #15803d; }
      .step-linked-task.slt-done .slt-avatar { background: #dcfce7; color: #15803d; }

      @media (max-width: 640px) {
        .milestone-slot { min-width: 160px; }
        .milestone-card { width: 160px; padding: 10px 12px; }
        .detail-panel { width: 100vw; }
      }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <a href="/" class="navbar-brand">Daily Logger</a>
      <div class="navbar-links">
        <a href="/">Home</a>
        <a href="/my-tasks">Tasks</a>
        <a href="/systems">Systems</a>
        <a href="/roadmaps" style="color:#0f172a;">Roadmaps</a>
        ${admin ? '<a href="/admin">Admin</a>' : ''}
      </div>
    </nav>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title" style="color: ${roadmap.color || '#2563eb'}">${escapeHtml(roadmap.name)}</h1>
        <div class="roadmap-switcher">
          <select onchange="if(this.value) window.location.href='/roadmaps/'+this.value">
            ${switcherOptions}
          </select>
        </div>
        <div style="margin-left:auto;display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="openAddMilestone()">+ Add Milestone</button>
          <button class="btn btn-secondary" onclick="openRoadmapSettings()">Settings</button>
        </div>
      </div>
      ${roadmap.description ? `<div class="roadmap-meta">${escapeHtml(roadmap.description)}</div>` : ''}

      <div class="timeline-wrapper" id="timelineWrapper">
        <div class="timeline-track" id="timelineTrack">
          <div class="timeline-line" id="timelineLine">
            <div class="timeline-progress" id="timelineProgress"></div>
          </div>
          <div class="timeline-milestones" id="timelineMilestones"></div>
        </div>
      </div>

      ${milestones.length === 0 ? `
        <div class="timeline-empty">
          <h3>No milestones yet</h3>
          <p>Add your first milestone to start building this roadmap timeline.</p>
        </div>
      ` : ''}
    </div>

    <!-- Detail Panel -->
    <div class="detail-overlay" id="detailOverlay">
      <div class="detail-panel" id="detailPanel">
        <div class="detail-panel-header">
          <h2 id="detailTitle" style="margin:0;font-size:18px;font-weight:700;"></h2>
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="detailStatusBadge"></span>
            <button class="btn btn-icon btn-secondary" onclick="closeDetail()" title="Close">&times;</button>
          </div>
        </div>
        <div class="detail-panel-body" id="detailBody"></div>
        <div class="detail-panel-footer">
          <button class="btn btn-danger btn-sm" onclick="deleteMilestone()">Delete</button>
          <button class="btn btn-primary btn-sm" onclick="saveMilestoneDetail()">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Add Milestone Modal -->
    <div class="modal-overlay" id="addMilestoneModal">
      <div class="modal-card">
        <h2 class="modal-title">Add Milestone</h2>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" id="msTitle" placeholder="Launch MVP" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="msDesc" rows="2" style="resize:vertical;min-height:60px;" placeholder="What needs to be accomplished…"></textarea>
        </div>
        <div style="display:flex;gap:12px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Due Date</label>
            <input class="form-input" id="msDueDate" type="date" />
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Status</label>
            <select class="form-input" id="msStatus">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Google Docs URL (optional)</label>
          <input class="form-input" id="msGoogleDocs" placeholder="https://docs.google.com/..." />
        </div>
        <div class="form-group">
          <label class="form-label">Link Task (optional)</label>
          <div id="msSelectedTaskBanner" style="display:none;margin-bottom:8px;"></div>
          <div class="task-picker-search-wrap">
            <input class="task-picker-search" id="msTaskSearch" placeholder="Search tasks by name, system, or tag…" oninput="filterTaskPicker()" />
            <button class="task-picker-clear" id="msSearchClear" onclick="document.getElementById('msTaskSearch').value='';filterTaskPicker();" style="display:none;">&times;</button>
          </div>
          <div class="task-picker" id="msTaskPicker"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-swatches" id="msColors">
            <div class="color-swatch active" data-color="${roadmap.color || '#2563eb'}" style="background:${roadmap.color || '#2563eb'};"></div>
            <div class="color-swatch" data-color="#7c3aed" style="background:#7c3aed;"></div>
            <div class="color-swatch" data-color="#db2777" style="background:#db2777;"></div>
            <div class="color-swatch" data-color="#dc2626" style="background:#dc2626;"></div>
            <div class="color-swatch" data-color="#ea580c" style="background:#ea580c;"></div>
            <div class="color-swatch" data-color="#16a34a" style="background:#16a34a;"></div>
            <div class="color-swatch" data-color="#0891b2" style="background:#0891b2;"></div>
            <div class="color-swatch" data-color="#64748b" style="background:#64748b;"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeAddMilestone()">Cancel</button>
          <button class="btn btn-primary" onclick="createMilestone()">Add Milestone</button>
        </div>
      </div>
    </div>

    <!-- Roadmap Settings Modal -->
    <div class="modal-overlay" id="settingsModal">
      <div class="modal-card">
        <h2 class="modal-title">Roadmap Settings</h2>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="setName" value="${escapeHtml(roadmap.name)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="setDesc" rows="3" style="resize:vertical;min-height:60px;">${escapeHtml(roadmap.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-swatches" id="setColors">
            <div class="color-swatch ${(roadmap.color||'#2563eb')==='#2563eb'?'active':''}" data-color="#2563eb" style="background:#2563eb;"></div>
            <div class="color-swatch ${roadmap.color==='#7c3aed'?'active':''}" data-color="#7c3aed" style="background:#7c3aed;"></div>
            <div class="color-swatch ${roadmap.color==='#db2777'?'active':''}" data-color="#db2777" style="background:#db2777;"></div>
            <div class="color-swatch ${roadmap.color==='#dc2626'?'active':''}" data-color="#dc2626" style="background:#dc2626;"></div>
            <div class="color-swatch ${roadmap.color==='#ea580c'?'active':''}" data-color="#ea580c" style="background:#ea580c;"></div>
            <div class="color-swatch ${roadmap.color==='#ca8a04'?'active':''}" data-color="#ca8a04" style="background:#ca8a04;"></div>
            <div class="color-swatch ${roadmap.color==='#16a34a'?'active':''}" data-color="#16a34a" style="background:#16a34a;"></div>
            <div class="color-swatch ${roadmap.color==='#0891b2'?'active':''}" data-color="#0891b2" style="background:#0891b2;"></div>
            <div class="color-swatch ${roadmap.color==='#64748b'?'active':''}" data-color="#64748b" style="background:#64748b;"></div>
          </div>
        </div>
        <div class="modal-actions">
          ${admin ? '<button class="btn btn-danger" onclick="deleteRoadmap()">Delete Roadmap</button>' : ''}
          <button class="btn btn-secondary" onclick="closeSettings()">Cancel</button>
          <button class="btn btn-primary" onclick="saveRoadmapSettings()">Save</button>
        </div>
      </div>
    </div>

    <!-- Step Edit Modal -->
    <div class="step-edit-overlay" id="stepEditOverlay">
      <div class="step-edit-card">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">Edit Step</h3>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" id="seTitle" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="seDesc" rows="2" style="resize:vertical;min-height:50px;"></textarea>
        </div>
        <div style="display:flex;gap:12px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Start Date</label>
            <input class="form-input" id="seStartDate" type="date" onchange="updateSeDuration()" />
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">End Date</label>
            <input class="form-input" id="seEndDate" type="date" onchange="updateSeDuration()" />
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:end;">
          <div class="form-group" style="flex:1;">
            <label class="form-label" style="font-size:11px;color:#94a3b8;">Duration <span id="seDurationDisplay" style="font-weight:600;color:#1e293b;"></span></label>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Status</label>
            <select class="form-input" id="seStatus">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div class="se-task-section">
          <label class="form-label">Linked Tasks</label>
          <div class="se-task-tags" id="seTaskTags"></div>
          <div class="se-task-picker-wrap">
            <div class="task-picker-search-wrap">
              <input class="task-picker-search" id="seTaskSearch" placeholder="Search tasks…" oninput="renderStepTaskPicker(this.value)" />
              <button class="task-picker-clear" id="seSearchClear" style="display:none;" onclick="document.getElementById('seTaskSearch').value='';renderStepTaskPicker('')">&times;</button>
            </div>
            <div class="se-task-picker-list" id="seTaskPicker"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-danger btn-sm" onclick="deleteEditingStep()">Delete Step</button>
          <button class="btn btn-secondary btn-sm" onclick="closeStepEdit()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="saveStepEdit()">Save</button>
        </div>
      </div>
    </div>

    <!-- Finalize Modal -->
    <div class="modal-overlay" id="finalizeModal">
      <div class="modal-card">
        <h2 class="modal-title">Finalize Milestone</h2>
        <div class="finalize-modal-body">
          <div class="finalize-summary" id="finalizeSummary"></div>
          <div class="form-group">
            <label class="form-label">Completion Notes (optional)</label>
            <textarea class="form-input" id="finalizeNotes" rows="3" placeholder="Any notes about this completion…" style="resize:vertical;"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeFinalizeModal()">Cancel</button>
          <button class="btn btn-primary" id="finalizeConfirmBtn" onclick="confirmFinalize()">Complete Milestone</button>
        </div>
      </div>
    </div>

    <script>
    const ROADMAP_ID = ${roadmap.id};
    const ROADMAP_COLOR = '${roadmap.color || '#2563eb'}';
    let milestonesData = ${milestoneDataJson};
    const allTasks = ${tasksJson};
    const allSystems = ${systemsJson};
    let selectedMilestoneId = null;
    let msSelectedColor = ROADMAP_COLOR;
    let setSelectedColor = '${roadmap.color || '#2563eb'}';
    let msSelectedTaskId = null;
    let editingStepId = null;
    let finalizeMode = null;

    const statusMeta = {
      'not-started': { bg: '#f1f5f9', text: '#64748b', label: 'Not Started' },
      'in-progress': { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
      'completed':   { bg: '#dcfce7', text: '#16a34a', label: 'Completed' },
    };

    function escHtml(str) {
      const d = document.createElement('div');
      d.textContent = str || '';
      return d.innerHTML;
    }

    function formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function isMediaFile(mime) { return mime && (mime.startsWith('image/') || mime.startsWith('video/')); }

    function fmtDuration(d) {
      if (d === 1) return '1 day';
      if (d < 1) return (d * 24) + 'h';
      return d + ' days';
    }

    function fmtDateRange(startDate, endDate) {
      const opts = { month: 'short', day: 'numeric' };
      if (startDate && endDate) {
        const s = new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', opts);
        const e = new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', opts);
        return s + ' → ' + e;
      }
      if (startDate) return new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', opts) + ' → …';
      if (endDate) return '… → ' + new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', opts);
      return '';
    }

    function calcDaysFromDates(startDate, endDate) {
      if (!startDate || !endDate) return 0;
      const diffMs = new Date(endDate + 'T00:00:00') - new Date(startDate + 'T00:00:00');
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // ── Render Timeline ──
    function renderTimeline() {
      const container = document.getElementById('timelineMilestones');
      const emptyEl = document.querySelector('.timeline-empty');
      if (!milestonesData.length) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = '';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';

      const completedCount = milestonesData.filter(m => m.status === 'completed').length;
      const pct = Math.round((completedCount / milestonesData.length) * 100);
      document.getElementById('timelineProgress').style.width = pct + '%';

      container.innerHTML = milestonesData.map((m) => {
        const s = statusMeta[m.status] || statusMeta['not-started'];
        const dateStr = m.due_date ? new Date(m.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const hasAttachments = m.attachments && m.attachments.length > 0;
        const hasGdocs = !!m.google_docs_url;
        const hasLinkedTask = !!m.linkedTask;
        const steps = m.steps || [];
        const stepsCompleted = steps.filter(st => st.status === 'completed').length;
        const stepsTotal = steps.length;

        let stepsBarHtml = '';
        if (stepsTotal > 0) {
          const segs = steps.map(st =>
            '<div class="sb-seg ' + (st.status === 'completed' ? 'sb-done' : st.status === 'in-progress' ? 'sb-active' : 'sb-pending') + '"></div>'
          ).join('');
          stepsBarHtml = '<div class="ms-steps-bar">' + segs + '</div>'
            + '<div class="ms-steps-label">' + stepsCompleted + '/' + stepsTotal + ' steps</div>';
        }

        return \`
          <div class="milestone-slot" onclick="openMilestoneDetail(\${m.id})" data-id="\${m.id}"
               draggable="true" ondragstart="msDragStart(event,\${m.id})" ondragend="msDragEnd(event)"
               ondragover="msDragOver(event)" ondrop="msDrop(event,\${m.id})">
            <div class="milestone-card status-\${m.status}">
              <div class="milestone-title">\${escHtml(m.title)}</div>
              \${dateStr ? '<div class="milestone-date">' + dateStr + '</div>' : ''}
              <span class="milestone-status" style="background:\${s.bg};color:\${s.text};">\${s.label}</span>
              <div class="milestone-extras">
                \${hasAttachments ? '<span class="me-icon">📎 ' + m.attachments.length + '</span>' : ''}
                \${hasGdocs ? '<span class="me-icon">📄 Docs</span>' : ''}
                \${hasLinkedTask ? '<span class="me-icon">🔗 Task</span>' : ''}
              </div>
              \${stepsBarHtml}
            </div>
            <div class="milestone-connector status-\${m.status}" style="background:\${m.status==='not-started'?'#e2e8f0':m.color};box-shadow:0 0 0 2px \${m.status==='not-started'?'#cbd5e1':m.color};"></div>
            \${dateStr ? '<div class="milestone-due-label">' + dateStr + '</div>' : '<div class="milestone-due-label" style="color:#cbd5e1;">No date</div>'}
          </div>
        \`;
      }).join('');
    }

    // ── Milestone Drag & Drop (main timeline reorder) ──
    let msDragId = null;
    function msDragStart(e, id) {
      msDragId = id;
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('ms-dragging');
      e.stopPropagation();
    }
    function msDragEnd(e) {
      msDragId = null;
      document.querySelectorAll('.ms-dragging').forEach(el => el.classList.remove('ms-dragging'));
      document.querySelectorAll('.ms-drag-over').forEach(el => el.classList.remove('ms-drag-over'));
    }
    function msDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const slot = e.currentTarget;
      document.querySelectorAll('.ms-drag-over').forEach(el => el.classList.remove('ms-drag-over'));
      if (msDragId !== null) slot.classList.add('ms-drag-over');
    }
    async function msDrop(e, targetId) {
      e.preventDefault();
      document.querySelectorAll('.ms-drag-over').forEach(el => el.classList.remove('ms-drag-over'));
      if (msDragId === null || msDragId === targetId) return;
      const fromIdx = milestonesData.findIndex(m => m.id === msDragId);
      const toIdx = milestonesData.findIndex(m => m.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = milestonesData.splice(fromIdx, 1);
      milestonesData.splice(toIdx, 0, moved);
      milestonesData.forEach((m, i) => m.position = i);
      renderTimeline();
      await fetch('/api/roadmaps/' + ROADMAP_ID + '/milestones/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: milestonesData.map(m => m.id) }),
      });
      msDragId = null;
    }

    // ── Detail Panel ──
    function openMilestoneDetail(id) {
      const ms = milestonesData.find(m => m.id === id);
      if (!ms) return;
      selectedMilestoneId = id;

      document.getElementById('detailTitle').textContent = ms.title;
      const s = statusMeta[ms.status] || statusMeta['not-started'];
      document.getElementById('detailStatusBadge').innerHTML =
        '<span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:' + s.bg + ';color:' + s.text + ';">' + s.label + '</span>';

      const steps = ms.steps || [];
      const stepsCompleted = steps.filter(st => st.status === 'completed').length;
      const stepsTotal = steps.length;
      const stepsPct = stepsTotal > 0 ? Math.round((stepsCompleted / stepsTotal) * 100) : 0;
      const totalDuration = steps.reduce((sum, st) => sum + (st.duration_days || 0), 0);

      // Compute overall date range from steps that have dates
      const stepsWithDates = steps.filter(st => st.start_date && st.end_date);
      let overallRange = '';
      if (stepsWithDates.length > 0) {
        const allStarts = stepsWithDates.map(st => st.start_date).sort();
        const allEnds = stepsWithDates.map(st => st.end_date).sort();
        overallRange = fmtDateRange(allStarts[0], allEnds[allEnds.length - 1]);
      }

      let attachmentsHtml = '';
      if (ms.attachments && ms.attachments.length > 0) {
        attachmentsHtml = ms.attachments.map(a => {
          const isMedia = isMediaFile(a.mime_type);
          return \`
            <div class="attachment-item">
              <a href="/uploads/\${a.filename}" target="_blank" class="att-name" title="\${escHtml(a.original_name)}">\${escHtml(a.original_name)}</a>
              <span class="att-size">\${formatFileSize(a.size)}</span>
              <button class="att-remove" onclick="removeAttachment(\${a.id}, event)" title="Remove">&times;</button>
            </div>
            \${isMedia ? (a.mime_type.startsWith('video/') ?
              '<video class="media-preview" controls src="/uploads/' + a.filename + '"></video>' :
              '<img class="media-preview" src="/uploads/' + a.filename + '" alt="" />'
            ) : ''}
          \`;
        }).join('');
      }

      let linkedTaskHtml = '';
      if (ms.linkedTask) {
        const ltAssigned = ms.linkedTask.assigned_to || '';
        const ltPeople = ltAssigned.split(',').map(s => s.trim()).filter(Boolean);
        const ltPeopleHtml = ltPeople.length > 0 ? '<div style="display:flex;align-items:center;gap:2px;margin-left:8px;">' + ltPeople.map(p => {
          const ini = p.split(/\\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
          return '<div style="width:22px;height:22px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#64748b;border:1.5px solid white;margin-left:-4px;" title="' + escHtml(p) + '">' + ini + '</div>';
        }).join('') + '</div>' : '';
        linkedTaskHtml = '<div class="linked-task-pill" onclick="openLinkedTask(' + ms.linkedTask.id + ')" title="Open task">'
          + '<span>' + (ms.linkedTask.is_completed ? '☑' : '☐') + ' ' + escHtml(ms.linkedTask.title) + '</span>'
          + '<span class="lt-system">' + escHtml(ms.linkedTask.system_name || '') + '</span>'
          + ltPeopleHtml
          + '<button class="att-remove" onclick="unlinkTask(event)" title="Unlink">&times;</button>'
          + '</div>';
      }

      // Steps sub-timeline HTML
      let stepsHtml = '';
      if (steps.length > 0) {
        let stepsListHtml = steps.map((st, idx) => {
          const dotCls = 'dot-' + st.status;
          const lineDone = st.status === 'completed' ? 'line-done' : '';
          const titleCls = st.status === 'completed' ? 's-done' : '';
          const btnCls = st.status === 'completed' ? 'ssb-done' : (st.status === 'in-progress' ? 'ssb-progress' : '');
          const btnIcon = st.status === 'completed' ? '✓' : (st.status === 'in-progress' ? '▸' : '✓');
          return \`
            <div class="step-item" data-step-id="\${st.id}" draggable="true"
                 ondragstart="stepDragStart(event,\${st.id})" ondragend="stepDragEnd(event)"
                 ondragover="stepDragOver(event)" ondrop="stepDrop(event,\${st.id})">
              <div class="step-connector-col">
                <div class="step-dot \${dotCls}"></div>
                <div class="step-line \${lineDone}"></div>
              </div>
              <div class="step-content">
                <div class="step-drag-handle" title="Drag to reorder">⠿</div>
                <div class="step-info">
                  <div class="step-title-row">
                    <span class="step-title \${titleCls}">\${escHtml(st.title)}</span>
                  </div>
                  \${st.description ? '<div class="step-desc">' + escHtml(st.description) + '</div>' : ''}
                  \${(function() {
                    const tasks = st.linkedTasks || [];
                    if (!tasks.length) return '';
                    let html = '<div class="step-linked-tasks">';
                    for (const lt of tasks) {
                      const doneCls = lt.is_completed ? ' slt-done' : '';
                      const people = (lt.assigned_to || '').split(',').map(s => s.trim()).filter(Boolean);
                      let avatarsHtml = '';
                      if (people.length > 0) {
                        const show = people.slice(0, 2);
                        avatarsHtml = '<span class="slt-assigned">';
                        for (const p of show) {
                          const ini = p.split(/\\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
                          avatarsHtml += '<span class="slt-avatar" title="' + escHtml(p) + '">' + ini + '</span>';
                        }
                        if (people.length > 2) avatarsHtml += '<span class="slt-avatar">+' + (people.length - 2) + '</span>';
                        avatarsHtml += '</span>';
                      }
                      html += '<div class="step-linked-task' + doneCls + '" onclick="openLinkedTask(' + lt.task_id + ')" title="' + escHtml(lt.title) + ' (' + escHtml(lt.system_name) + ')">';
                      html += '<span class="slt-dot" style="background:' + (lt.system_color || '#94a3b8') + '"></span>';
                      html += '<span class="slt-check">' + (lt.is_completed ? '✓' : '○') + '</span>';
                      html += '<span class="slt-name">' + escHtml(lt.title) + '</span>';
                      if (lt.due_date) {
                        const dd = new Date(lt.due_date);
                        const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dd.getMonth()];
                        const overdue = !lt.is_completed && dd < new Date() ? ' slt-overdue' : '';
                        html += '<span class="slt-due' + overdue + '">' + mon + ' ' + dd.getDate() + '</span>';
                      }
                      html += avatarsHtml;
                      html += '</div>';
                    }
                    html += '</div>';
                    return html;
                  })()}
                </div>
                <div class="step-duration">
                  \${st.start_date && st.end_date
                    ? '<span class="sd-dates">' + fmtDateRange(st.start_date, st.end_date) + '</span><span class="sd-days">(' + fmtDuration(st.duration_days) + ')</span>'
                    : '<span class="sd-icon">⏱</span>' + fmtDuration(st.duration_days)}
                </div>
                <button class="step-status-btn \${btnCls}" onclick="cycleStepStatus(event, \${st.id})" title="Toggle status">\${btnIcon}</button>
                <div class="step-actions">
                  <button class="step-action-btn" onclick="openStepEdit(event, \${st.id})" title="Edit">✏</button>
                  <button class="step-action-btn sa-delete" onclick="deleteStep(event, \${st.id})" title="Delete">🗑</button>
                </div>
              </div>
            </div>
          \`;
        }).join('');

        stepsHtml = \`
          <div class="steps-progress-bar">
            <div class="steps-progress-track">
              <div class="steps-progress-fill" style="width:\${stepsPct}%"></div>
            </div>
            <span class="steps-progress-text">\${stepsCompleted}/\${stepsTotal}</span>
          </div>
          \${totalDuration > 0 ? '<div class="steps-total-duration">' + (overallRange ? overallRange + ' &middot; ' : '') + fmtDuration(totalDuration) + ' total</div>' : ''}
          <div class="steps-timeline" id="stepsTimeline">\${stepsListHtml}</div>
          <div class="add-step-row">
            <input class="add-step-input" id="addStepInput" placeholder="Add a step…"
                   onkeydown="if(event.key==='Enter')addStep()" />
            <button class="btn btn-sm btn-primary" onclick="addStep()">Add</button>
          </div>
        \`;
      } else {
        stepsHtml = \`
          <p style="font-size:13px;color:#94a3b8;margin-bottom:12px;">No steps yet. Add steps to track progress within this milestone.</p>
          <div class="add-step-row" style="padding-left:0;">
            <input class="add-step-input" id="addStepInput" placeholder="Add a step…"
                   onkeydown="if(event.key==='Enter')addStep()" />
            <button class="btn btn-sm btn-primary" onclick="addStep()">Add</button>
          </div>
        \`;
      }

      // Template strip
      const templateStrip = \`
        <div class="template-strip">
          <span style="font-size:11px;color:#94a3b8;align-self:center;">Templates:</span>
          <button class="template-btn" onclick="applyTemplate('standard-dev')">🔧 Standard Dev</button>
          <button class="template-btn" onclick="applyTemplate('quick-task')">⚡ Quick Task</button>
          <button class="template-btn" onclick="applyTemplate('research')">🔬 Research</button>
          <button class="template-btn" onclick="applyTemplate('release')">🚀 Release</button>
        </div>
      \`;

      // Finalization section
      const allStepsDone = stepsTotal > 0 && stepsCompleted === stepsTotal;
      const finalizeHtml = stepsTotal > 0 ? \`
        <div class="finalize-section">
          <div class="detail-card-title">Finalize</div>
          <div class="finalize-options">
            <button class="finalize-btn fb-complete" onclick="openFinalize('complete')" \${allStepsDone ? '' : 'disabled'} title="\${allStepsDone ? 'Mark as complete' : 'Complete all steps first'}">
              ✓ Mark Complete
            </button>
            <button class="finalize-btn fb-review" onclick="openFinalize('review')">
              📝 Complete with Notes
            </button>
            <button class="finalize-btn fb-archive" onclick="openFinalize('archive')">
              📦 Complete & Archive
            </button>
          </div>
        </div>
      \` : '';

      document.getElementById('detailBody').innerHTML = \`
        <div class="detail-card">
          <div class="detail-card-title">Details</div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px;">Title</label>
            <input class="form-input" id="editTitle" value="\${escHtml(ms.title)}" />
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px;">Description</label>
            <textarea class="form-input" id="editDesc" rows="2" style="resize:vertical;min-height:50px;">\${escHtml(ms.description)}</textarea>
          </div>
          <div style="display:flex;gap:12px;">
            <div class="form-group" style="flex:1;margin-bottom:0;">
              <label class="form-label" style="font-size:12px;">Due Date</label>
              <input class="form-input" id="editDueDate" type="date" value="\${ms.due_date || ''}" />
            </div>
            <div class="form-group" style="flex:1;margin-bottom:0;">
              <label class="form-label" style="font-size:12px;">Status</label>
              <select class="form-input" id="editStatus">
                <option value="not-started" \${ms.status==='not-started'?'selected':''}>Not Started</option>
                <option value="in-progress" \${ms.status==='in-progress'?'selected':''}>In Progress</option>
                <option value="completed" \${ms.status==='completed'?'selected':''}>Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">
            Steps
            <span class="dct-badge">\${stepsTotal > 0 ? stepsCompleted + '/' + stepsTotal : 'none'}</span>
          </div>
          \${stepsHtml}
          \${templateStrip}
          \${finalizeHtml}
        </div>

        <div class="detail-card">
          <div class="detail-card-title">Linked Task</div>
          \${linkedTaskHtml || '<p style="font-size:13px;color:#94a3b8;">No task linked</p>'}
          <button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="openLinkTaskModal()">Link a Task</button>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">Google Docs</div>
          <input class="form-input" id="editGoogleDocs" value="\${escHtml(ms.google_docs_url)}" placeholder="https://docs.google.com/..." />
          \${ms.google_docs_url ? '<a class="gdocs-link" href="' + escHtml(ms.google_docs_url) + '" target="_blank" rel="noopener" style="margin-top:8px;">📄 Open Google Doc</a>' : ''}
        </div>

        <div class="detail-card">
          <div class="detail-card-title">
            Attachments
            <span class="dct-badge">\${(ms.attachments||[]).length}</span>
          </div>
          <div id="detailAttachments">\${attachmentsHtml || '<p style="font-size:13px;color:#94a3b8;">No attachments</p>'}</div>
          <div style="margin-top:10px;">
            <label class="btn btn-sm btn-secondary" style="cursor:pointer;">
              Upload Files
              <input type="file" multiple style="display:none;" onchange="uploadMilestoneFiles(this.files)" />
            </label>
          </div>
        </div>

        \${ms.completed_at ? '<div class="detail-card"><div class="detail-card-title">Completed</div><p style="font-size:13px;color:#16a34a;">' + new Date(ms.completed_at).toLocaleString() + '</p></div>' : ''}
      \`;

      document.getElementById('detailOverlay').classList.add('active');
    }

    function closeDetail() {
      document.getElementById('detailOverlay').classList.remove('active');
      selectedMilestoneId = null;
    }
    document.getElementById('detailOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeDetail();
    });

    // ── Steps: CRUD ──
    async function addStep() {
      if (!selectedMilestoneId) return;
      const input = document.getElementById('addStepInput');
      const title = (input.value || '').trim();
      if (!title) return;
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/steps', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, duration_days: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) {
          if (!ms.steps) ms.steps = [];
          ms.steps.push({ id: data.id, title, description: '', duration_days: 1, start_date: '', end_date: '', status: 'not-started', position: data.position, completed_at: '', linkedTasks: [] });
        }
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
        // Focus input again
        setTimeout(() => { const inp = document.getElementById('addStepInput'); if (inp) inp.focus(); }, 100);
      }
    }

    async function cycleStepStatus(e, stepId) {
      e.stopPropagation();
      if (!selectedMilestoneId) return;
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      if (!ms) return;
      const step = (ms.steps || []).find(s => s.id === stepId);
      if (!step) return;

      const cycle = { 'not-started': 'in-progress', 'in-progress': 'completed', 'completed': 'not-started' };
      const newStatus = cycle[step.status] || 'not-started';

      const res = await fetch('/api/steps/' + stepId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        step.status = newStatus;
        if (newStatus === 'completed') step.completed_at = new Date().toISOString();
        else step.completed_at = '';
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    async function deleteStep(e, stepId) {
      e.stopPropagation();
      if (!confirm('Delete this step?')) return;
      const res = await fetch('/api/steps/' + stepId, { method: 'DELETE' });
      if (res.ok) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) ms.steps = (ms.steps || []).filter(s => s.id !== stepId);
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    let seSelectedTaskIds = [];

    function openStepEdit(e, stepId) {
      e.stopPropagation();
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      if (!ms) return;
      const step = (ms.steps || []).find(s => s.id === stepId);
      if (!step) return;
      editingStepId = stepId;
      document.getElementById('seTitle').value = step.title;
      document.getElementById('seDesc').value = step.description || '';
      document.getElementById('seStartDate').value = step.start_date || '';
      document.getElementById('seEndDate').value = step.end_date || '';
      updateSeDuration();
      document.getElementById('seStatus').value = step.status;
      seSelectedTaskIds = (step.linkedTasks || []).map(lt => lt.task_id);
      document.getElementById('seTaskSearch').value = '';
      renderStepTaskTags();
      renderStepTaskPicker('');
      document.getElementById('stepEditOverlay').classList.add('active');
    }

    function closeStepEdit() {
      document.getElementById('stepEditOverlay').classList.remove('active');
      editingStepId = null;
    }
    document.getElementById('stepEditOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeStepEdit();
    });

    function updateSeDuration() {
      const sd = document.getElementById('seStartDate').value;
      const ed = document.getElementById('seEndDate').value;
      const display = document.getElementById('seDurationDisplay');
      if (sd && ed) {
        const days = calcDaysFromDates(sd, ed);
        display.textContent = fmtDuration(days);
        display.style.color = '#1e293b';
      } else if (sd || ed) {
        display.textContent = 'set both dates';
        display.style.color = '#94a3b8';
      } else {
        display.textContent = 'no dates set';
        display.style.color = '#94a3b8';
      }
    }

    function renderStepTaskPicker(filter) {
      renderGroupedPickerMulti('seTaskPicker', filter, seSelectedTaskIds, stepToggleTask);
      const clearBtn = document.getElementById('seSearchClear');
      if (clearBtn) clearBtn.style.display = filter ? '' : 'none';
    }
    function stepToggleTask(id) {
      const idx = seSelectedTaskIds.indexOf(id);
      if (idx >= 0) {
        seSelectedTaskIds.splice(idx, 1);
      } else {
        seSelectedTaskIds.push(id);
      }
      renderStepTaskPicker(document.getElementById('seTaskSearch').value);
      renderStepTaskTags();
    }
    function stepRemoveTask(id) {
      seSelectedTaskIds = seSelectedTaskIds.filter(tid => tid !== id);
      renderStepTaskPicker(document.getElementById('seTaskSearch').value);
      renderStepTaskTags();
    }
    function renderStepTaskTags() {
      const container = document.getElementById('seTaskTags');
      if (!container) return;
      if (!seSelectedTaskIds.length) { container.innerHTML = ''; return; }
      container.innerHTML = seSelectedTaskIds.map(tid => {
        const t = allTasks.find(tk => tk.id === tid);
        if (!t) return '';
        const sys = allSystems.find(s => s.id === t.system_id);
        return '<div class="se-task-tag">'
          + '<span class="se-tag-dot" style="background:' + (sys ? sys.color : '#94a3b8') + '"></span>'
          + escHtml(t.title)
          + '<button class="se-tag-remove" onclick="stepRemoveTask(' + tid + ')" title="Remove">&times;</button>'
          + '</div>';
      }).join('');
    }

    // Multi-select picker (like renderGroupedPicker but highlights multiple)
    function renderGroupedPickerMulti(pickerId, filter, selectedIds, onToggle) {
      const picker = document.getElementById(pickerId);
      if (!picker) return;
      const lf = (filter || '').toLowerCase();
      const filtered = allTasks.filter(t => {
        if (!lf) return true;
        return t.title.toLowerCase().includes(lf) || (t.system_name||'').toLowerCase().includes(lf)
          || (t.tags||'').toLowerCase().includes(lf) || (t.assigned_to||'').toLowerCase().includes(lf);
      });
      if (filtered.length === 0) {
        picker.innerHTML = '<div class="task-picker-empty">No tasks matching "' + escHtml(filter) + '"</div>';
        return;
      }
      const groups = {}; const groupOrder = [];
      for (const t of filtered) {
        const key = t.system_id || 0;
        if (!groups[key]) {
          groups[key] = { systemName: t.system_name || 'No System', tasks: [], color: '' };
          const sys = allSystems.find(s => s.id === key);
          groups[key].color = sys ? sys.color : '#94a3b8';
          groupOrder.push(key);
        }
        groups[key].tasks.push(t);
      }
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      let html = '';
      for (const key of groupOrder) {
        const g = groups[key];
        g.tasks.sort((a, b) => {
          if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
          return (priorityOrder[a.priority]||2) - (priorityOrder[b.priority]||2);
        });
        html += '<div class="task-picker-system-group">';
        html += '<div class="task-picker-system-header"><span class="tp-sys-dot" style="background:' + g.color + '"></span>' + escHtml(g.systemName) + '<span class="tp-sys-count">' + g.tasks.length + ' task' + (g.tasks.length!==1?'s':'') + '</span></div>';
        for (const t of g.tasks) {
          const isSelected = selectedIds.includes(t.id);
          html += '<div class="task-picker-item ' + (isSelected ? 'selected' : '') + '" onclick="' + onToggle.name + '(' + t.id + ')">';
          html += '<div class="tp-check ' + (isSelected ? 'done' : '') + '">' + (isSelected ? '&#10003;' : '') + '</div>';
          html += '<span class="tp-title ' + (t.is_completed?'done':'') + '">' + escHtml(t.title) + '</span>';
          if (t.assigned_to) {
            const people = t.assigned_to.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2);
            if (people.length) {
              html += '<span style="font-size:11px;color:#94a3b8;">' + escHtml(people.join(', ')) + '</span>';
            }
          }
          html += '</div>';
        }
        html += '</div>';
      }
      picker.innerHTML = html;
    }

    async function saveStepEdit() {
      if (!editingStepId) return;
      const seStartDate = document.getElementById('seStartDate').value || null;
      const seEndDate = document.getElementById('seEndDate').value || null;
      let seDurationDays = 1;
      if (seStartDate && seEndDate) {
        seDurationDays = calcDaysFromDates(seStartDate, seEndDate);
      }
      const body = {
        title: document.getElementById('seTitle').value.trim(),
        description: document.getElementById('seDesc').value.trim(),
        duration_days: seDurationDays,
        start_date: seStartDate,
        end_date: seEndDate,
        status: document.getElementById('seStatus').value,
      };
      if (!body.title) return alert('Title is required');
      const res = await fetch('/api/steps/' + editingStepId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // Sync linked tasks: figure out adds and removes
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        const step = ms ? (ms.steps || []).find(s => s.id === editingStepId) : null;
        const currentIds = step ? (step.linkedTasks || []).map(lt => lt.task_id) : [];
        const toAdd = seSelectedTaskIds.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !seSelectedTaskIds.includes(id));

        // Add new tasks
        for (const tid of toAdd) {
          const addRes = await fetch('/api/steps/' + editingStepId + '/tasks', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: tid }),
          });
          if (addRes.ok) {
            const data = await addRes.json();
            if (step && data.task) {
              if (!step.linkedTasks) step.linkedTasks = [];
              step.linkedTasks.push(data.task);
            }
          }
        }
        // Remove tasks
        for (const tid of toRemove) {
          await fetch('/api/steps/' + editingStepId + '/tasks/' + tid, { method: 'DELETE' });
          if (step) {
            step.linkedTasks = (step.linkedTasks || []).filter(lt => lt.task_id !== tid);
          }
        }

        if (step) {
          Object.assign(step, body);
          step.start_date = body.start_date || '';
          step.end_date = body.end_date || '';
          if (body.status === 'completed' && !step.completed_at) step.completed_at = new Date().toISOString();
          if (body.status !== 'completed') step.completed_at = '';
        }
        closeStepEdit();
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    async function deleteEditingStep() {
      if (!editingStepId || !confirm('Delete this step?')) return;
      const res = await fetch('/api/steps/' + editingStepId, { method: 'DELETE' });
      if (res.ok) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) ms.steps = (ms.steps || []).filter(s => s.id !== editingStepId);
        closeStepEdit();
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    // ── Steps: Drag & Drop ──
    let stepDragId = null;
    function stepDragStart(e, id) {
      stepDragId = id;
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.classList.add('step-dragging');
      e.stopPropagation();
    }
    function stepDragEnd(e) {
      stepDragId = null;
      document.querySelectorAll('.step-dragging').forEach(el => el.classList.remove('step-dragging'));
      document.querySelectorAll('.step-drag-over').forEach(el => el.classList.remove('step-drag-over'));
    }
    function stepDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const item = e.currentTarget;
      document.querySelectorAll('.step-drag-over').forEach(el => el.classList.remove('step-drag-over'));
      if (stepDragId !== null) item.classList.add('step-drag-over');
    }
    async function stepDrop(e, targetId) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.step-drag-over').forEach(el => el.classList.remove('step-drag-over'));
      if (stepDragId === null || stepDragId === targetId) return;
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      if (!ms || !ms.steps) return;
      const fromIdx = ms.steps.findIndex(s => s.id === stepDragId);
      const toIdx = ms.steps.findIndex(s => s.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = ms.steps.splice(fromIdx, 1);
      ms.steps.splice(toIdx, 0, moved);
      ms.steps.forEach((s, i) => s.position = i);
      openMilestoneDetail(selectedMilestoneId);
      await fetch('/api/milestones/' + selectedMilestoneId + '/steps/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: ms.steps.map(s => s.id) }),
      });
      stepDragId = null;
    }

    // ── Templates ──
    async function applyTemplate(template) {
      if (!selectedMilestoneId) return;
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      if (ms && ms.steps && ms.steps.length > 0) {
        if (!confirm('This will add template steps to existing steps. Continue?')) return;
      }
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/steps/template', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      });
      const data = await res.json();
      if (data.success && data.steps) {
        if (ms) {
          if (!ms.steps) ms.steps = [];
          for (const s of data.steps) {
            ms.steps.push({ id: s.id, title: s.title, description: s.description || '', duration_days: s.duration_days, start_date: '', end_date: '', status: 'not-started', position: s.position, completed_at: '', linkedTasks: [] });
          }
        }
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    // ── Finalization ──
    function openFinalize(mode) {
      finalizeMode = mode;
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      if (!ms) return;
      const steps = ms.steps || [];
      const completed = steps.filter(s => s.status === 'completed').length;
      const totalDays = steps.reduce((sum, s) => sum + (s.duration_days || 0), 0);
      const remaining = steps.length - completed;

      const labels = {
        'complete': 'Mark as Complete',
        'review': 'Complete with Review Notes',
        'archive': 'Complete & Archive',
      };

      document.getElementById('finalizeSummary').innerHTML = \`
        <div class="finalize-stat">
          <div class="fs-val">\${steps.length}</div>
          <div class="fs-label">Total Steps</div>
        </div>
        <div class="finalize-stat">
          <div class="fs-val">\${completed}</div>
          <div class="fs-label">Completed</div>
        </div>
        <div class="finalize-stat">
          <div class="fs-val" style="color:\${remaining > 0 ? '#dc2626' : '#16a34a'};">\${remaining}</div>
          <div class="fs-label">Remaining</div>
        </div>
        <div class="finalize-stat">
          <div class="fs-val">\${totalDays}</div>
          <div class="fs-label">Total Days</div>
        </div>
      \`;

      document.getElementById('finalizeConfirmBtn').textContent = labels[mode] || 'Complete';
      document.getElementById('finalizeModal').classList.add('active');
    }

    function closeFinalizeModal() {
      document.getElementById('finalizeModal').classList.remove('active');
      finalizeMode = null;
    }
    document.getElementById('finalizeModal').addEventListener('click', function(e) {
      if (e.target === this) closeFinalizeModal();
    });

    async function confirmFinalize() {
      if (!selectedMilestoneId || !finalizeMode) return;
      const notes = document.getElementById('finalizeNotes').value.trim();
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: finalizeMode, notes }),
      });
      if (res.ok) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) {
          ms.status = 'completed';
          ms.completed_at = new Date().toISOString();
          (ms.steps || []).forEach(s => { s.status = 'completed'; s.completed_at = new Date().toISOString(); });
        }
        closeFinalizeModal();
        closeDetail();
        renderTimeline();
      } else {
        alert('Failed to finalize');
      }
    }

    // ── Save milestone changes ──
    async function saveMilestoneDetail() {
      if (!selectedMilestoneId) return;
      const ms = milestonesData.find(m => m.id === selectedMilestoneId);
      const body = {
        title: document.getElementById('editTitle').value.trim(),
        description: document.getElementById('editDesc').value.trim(),
        due_date: document.getElementById('editDueDate').value || null,
        status: document.getElementById('editStatus').value,
        google_docs_url: document.getElementById('editGoogleDocs').value.trim() || null,
        task_id: ms ? ms.task_id : null,
        system_id: ms ? ms.system_id : null,
        color: ms ? ms.color : null,
      };
      if (!body.title) return alert('Title is required');

      const res = await fetch('/api/milestones/' + selectedMilestoneId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (ms) {
          Object.assign(ms, body);
          if (body.status === 'completed' && !ms.completed_at) ms.completed_at = new Date().toISOString();
          if (body.status !== 'completed') ms.completed_at = '';
        }
        renderTimeline();
        closeDetail();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save');
      }
    }

    // ── Delete milestone ──
    async function deleteMilestone() {
      if (!selectedMilestoneId) return;
      if (!confirm('Delete this milestone? This cannot be undone.')) return;
      const res = await fetch('/api/milestones/' + selectedMilestoneId, { method: 'DELETE' });
      if (res.ok) {
        milestonesData = milestonesData.filter(m => m.id !== selectedMilestoneId);
        renderTimeline();
        closeDetail();
      } else {
        alert('Failed to delete milestone');
      }
    }

    // ── Upload files ──
    async function uploadMilestoneFiles(files) {
      if (!selectedMilestoneId || !files.length) return;
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/attachments', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms && data.attachments) ms.attachments = [...(ms.attachments || []), ...data.attachments];
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      } else { alert('Upload failed'); }
    }

    async function removeAttachment(attId, e) {
      e.stopPropagation();
      if (!confirm('Remove this attachment?')) return;
      const res = await fetch('/api/roadmap-attachments/' + attId, { method: 'DELETE' });
      if (res.ok) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) ms.attachments = (ms.attachments || []).filter(a => a.id !== attId);
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    // ── Link / Unlink Task ──
    function openLinkTaskModal() {
      const cards = document.querySelectorAll('#detailBody .detail-card');
      const taskCard = cards[2]; // "Linked Task" card
      if (!taskCard) return;
      const existing = taskCard.querySelector('.task-picker');
      if (existing) return;
      taskCard.insertAdjacentHTML('beforeend', \`
        <div style="margin-top:8px;">
          <div class="task-picker-search-wrap">
            <input class="task-picker-search" placeholder="Search tasks…" oninput="filterDetailTaskPicker(this.value)" />
          </div>
          <div class="task-picker" id="detailTaskPicker"></div>
        </div>
      \`);
      renderGroupedPicker('detailTaskPicker', '', null, linkTaskToMilestone);
    }

    function filterDetailTaskPicker(val) {
      renderGroupedPicker('detailTaskPicker', val, null, linkTaskToMilestone);
    }

    async function linkTaskToMilestone(taskId) {
      if (!selectedMilestoneId) return;
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/link-task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId })
      });
      if (res.ok) {
        const task = allTasks.find(t => t.id === taskId);
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms && task) {
          ms.task_id = taskId;
          ms.system_id = task.system_id;
          ms.linkedTask = { id: task.id, title: task.title, system_name: task.system_name, is_completed: task.is_completed, assigned_to: task.assigned_to || '' };
        }
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    async function unlinkTask(e) {
      e.stopPropagation();
      if (!selectedMilestoneId) return;
      const res = await fetch('/api/milestones/' + selectedMilestoneId + '/unlink-task', { method: 'POST' });
      if (res.ok) {
        const ms = milestonesData.find(m => m.id === selectedMilestoneId);
        if (ms) { ms.task_id = null; ms.system_id = null; ms.linkedTask = null; }
        openMilestoneDetail(selectedMilestoneId);
        renderTimeline();
      }
    }

    function openLinkedTask(taskId) {
      const t = allTasks.find(tk => tk.id === taskId);
      if (!t || !t.system_id) return;
      window.open('/systems/' + t.system_id + '/tasks/' + taskId, '_blank');
    }

    // ── Add Milestone Modal ──
    function openAddMilestone() { document.getElementById('addMilestoneModal').classList.add('active'); renderModalTaskPicker(''); }
    function closeAddMilestone() { document.getElementById('addMilestoneModal').classList.remove('active'); msSelectedTaskId = null; }
    document.getElementById('addMilestoneModal').addEventListener('click', function(e) { if (e.target === this) closeAddMilestone(); });

    document.querySelectorAll('#msColors .color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('#msColors .color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        msSelectedColor = el.dataset.color;
      });
    });

    // ── Grouped task picker (shared) ──
    function renderGroupedPicker(pickerId, filter, selectedId, onSelect) {
      const picker = document.getElementById(pickerId);
      if (!picker) return;
      const lf = (filter || '').toLowerCase();
      const filtered = allTasks.filter(t => {
        if (!lf) return true;
        return t.title.toLowerCase().includes(lf) || (t.system_name||'').toLowerCase().includes(lf)
          || (t.tags||'').toLowerCase().includes(lf) || (t.assigned_to||'').toLowerCase().includes(lf);
      });
      if (filtered.length === 0) {
        picker.innerHTML = '<div class="task-picker-empty">No tasks matching "' + escHtml(filter) + '"</div>';
        return;
      }
      const groups = {}; const groupOrder = [];
      for (const t of filtered) {
        const key = t.system_id || 0;
        if (!groups[key]) {
          groups[key] = { systemName: t.system_name || 'No System', tasks: [], color: '' };
          const sys = allSystems.find(s => s.id === key);
          groups[key].color = sys ? sys.color : '#94a3b8';
          groupOrder.push(key);
        }
        groups[key].tasks.push(t);
      }
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      function renderAvatars(assignedStr) {
        if (!assignedStr) return '';
        const people = assignedStr.split(',').map(s => s.trim()).filter(Boolean);
        if (!people.length) return '';
        const show = people.slice(0, 3); const extra = people.length - 3;
        let html = '<div class="tp-assigned">';
        for (const p of show) {
          const ini = p.split(/\\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
          html += '<div class="tp-avatar" title="' + escHtml(p) + '">' + ini + '</div>';
        }
        if (extra > 0) html += '<div class="tp-avatar tp-avatar-more">+' + extra + '</div>';
        return html + '</div>';
      }
      let html = '';
      for (const key of groupOrder) {
        const g = groups[key];
        g.tasks.sort((a, b) => {
          if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
          return (priorityOrder[a.priority]||2) - (priorityOrder[b.priority]||2);
        });
        html += '<div class="task-picker-system-group">';
        html += '<div class="task-picker-system-header"><span class="tp-sys-dot" style="background:' + g.color + '"></span>' + escHtml(g.systemName) + '<span class="tp-sys-count">' + g.tasks.length + ' task' + (g.tasks.length!==1?'s':'') + '</span></div>';
        for (const t of g.tasks) {
          const isSelected = selectedId === t.id;
          const pCls = 'tp-p-' + (t.priority || 'medium');
          const dueStr = t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          html += '<div class="task-picker-item ' + (isSelected ? 'selected' : '') + '" onclick="(' + (onSelect.name || 'void') + ')(' + t.id + ')">';
          html += '<div class="tp-check ' + (t.is_completed?'done':'') + '">' + (t.is_completed?'&#10003;':'') + '</div>';
          html += '<span class="tp-title ' + (t.is_completed?'done':'') + '">' + escHtml(t.title) + '</span>';
          html += '<div class="tp-meta">' + renderAvatars(t.assigned_to);
          if (t.priority && t.priority !== 'medium') html += '<span class="tp-priority ' + pCls + '">' + t.priority + '</span>';
          if (dueStr) html += '<span class="tp-due">' + dueStr + '</span>';
          html += '</div></div>';
        }
        html += '</div>';
      }
      picker.innerHTML = html;
    }

    function renderModalTaskPicker(filter) {
      renderGroupedPicker('msTaskPicker', filter, msSelectedTaskId, selectModalTask);
      const clearBtn = document.getElementById('msSearchClear');
      if (clearBtn) clearBtn.style.display = filter ? '' : 'none';
      updateSelectedTaskBanner();
    }
    function filterTaskPicker() { renderModalTaskPicker(document.getElementById('msTaskSearch').value); }
    function selectModalTask(id) { msSelectedTaskId = msSelectedTaskId === id ? null : id; renderModalTaskPicker(document.getElementById('msTaskSearch').value); }
    function clearSelectedTask() { msSelectedTaskId = null; renderModalTaskPicker(document.getElementById('msTaskSearch').value); }
    function updateSelectedTaskBanner() {
      const banner = document.getElementById('msSelectedTaskBanner');
      if (!banner) return;
      if (!msSelectedTaskId) { banner.style.display = 'none'; return; }
      const t = allTasks.find(tk => tk.id === msSelectedTaskId);
      if (!t) { banner.style.display = 'none'; return; }
      const sys = allSystems.find(s => s.id === t.system_id);
      banner.style.display = '';
      banner.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">'
        + '<span style="width:8px;height:8px;border-radius:50%;background:' + (sys?sys.color:'#94a3b8') + ';flex-shrink:0;"></span>'
        + '<span style="font-size:13px;font-weight:600;color:#1e293b;flex:1;">' + escHtml(t.title) + '</span>'
        + '<span style="font-size:11px;color:#64748b;">' + escHtml(t.system_name) + '</span>'
        + (t.assigned_to ? '<span style="font-size:11px;color:#94a3b8;">' + escHtml(t.assigned_to) + '</span>' : '')
        + '<button onclick="clearSelectedTask()" style="border:none;background:none;cursor:pointer;color:#dc2626;font-size:14px;padding:2px;">&times;</button></div>';
    }

    async function createMilestone() {
      const title = document.getElementById('msTitle').value.trim();
      if (!title) return alert('Title is required');
      const body = {
        title,
        description: document.getElementById('msDesc').value.trim(),
        due_date: document.getElementById('msDueDate').value || null,
        status: document.getElementById('msStatus').value,
        color: msSelectedColor,
        google_docs_url: document.getElementById('msGoogleDocs').value.trim() || null,
        task_id: msSelectedTaskId || null,
        system_id: msSelectedTaskId ? (allTasks.find(t => t.id === msSelectedTaskId) || {}).system_id || null : null,
      };
      const res = await fetch('/api/roadmaps/' + ROADMAP_ID + '/milestones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        const linkedTask = msSelectedTaskId ? allTasks.find(t => t.id === msSelectedTaskId) : null;
        milestonesData.push({
          id: data.id, ...body, position: milestonesData.length, content: '', attachments: [], steps: [],
          linkedTask: linkedTask ? { id: linkedTask.id, title: linkedTask.title, system_name: linkedTask.system_name, is_completed: linkedTask.is_completed, assigned_to: linkedTask.assigned_to || '' } : null,
          completed_at: body.status === 'completed' ? new Date().toISOString() : '',
        });
        renderTimeline();
        closeAddMilestone();
        document.getElementById('msTitle').value = '';
        document.getElementById('msDesc').value = '';
        document.getElementById('msDueDate').value = '';
        document.getElementById('msStatus').value = 'not-started';
        document.getElementById('msGoogleDocs').value = '';
        msSelectedTaskId = null;
      } else {
        alert(data.error || 'Failed to create milestone');
      }
    }

    // ── Settings Modal ──
    function openRoadmapSettings() { document.getElementById('settingsModal').classList.add('active'); }
    function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }
    document.getElementById('settingsModal').addEventListener('click', function(e) { if (e.target === this) closeSettings(); });

    document.querySelectorAll('#setColors .color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('#setColors .color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        setSelectedColor = el.dataset.color;
      });
    });

    async function saveRoadmapSettings() {
      const name = document.getElementById('setName').value.trim();
      if (!name) return alert('Name is required');
      const res = await fetch('/api/roadmaps/' + ROADMAP_ID, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: document.getElementById('setDesc').value.trim(), color: setSelectedColor }),
      });
      if (res.ok) window.location.reload();
      else alert('Failed to save settings');
    }

    async function deleteRoadmap() {
      if (!confirm('Delete this entire roadmap and all its milestones? This cannot be undone.')) return;
      const res = await fetch('/api/roadmaps/' + ROADMAP_ID, { method: 'DELETE' });
      if (res.ok) window.location.href = '/roadmaps';
      else alert('Failed to delete roadmap');
    }

    renderTimeline();
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
  roadmapsListPage,
  roadmapDetailPage,
};
