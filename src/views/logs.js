const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');

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
            <div>Logged in as <strong>@${currentUserEscaped}</strong> · <a href="/profile" style="font-size:12px;">Profile</a></div>
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


module.exports = {
  editLogPage,
  logHistoryPage,
  newLogPage,
};
