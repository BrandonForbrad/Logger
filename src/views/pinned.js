const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');

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
            <div>Logged in as <strong>@${currentUserEscaped}</strong> · <a href="/profile" style="font-size:12px;">Profile</a></div>
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


module.exports = {
  pinnedNewPage,
  pinnedHistoryPage,
  pinnedEditPage,
  pinnedDetailPage,
};
