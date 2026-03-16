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

module.exports = {
  uploadOverlayCss,
  uploadOverlayHtml,
  uploadOverlayClientJs,
  systemsBaseCss,
};
