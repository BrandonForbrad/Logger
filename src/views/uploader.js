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
        <p class="sub">Logged in as <strong>@${currentUserEscaped}</strong> · <a href="/profile" style="font-size:12px;">Profile</a>. This page handles large media uploads.</p>

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


module.exports = {
  uploaderPage,
};
