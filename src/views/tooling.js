const LANG_COLORS = {
  node:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Node.js' },
  python: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Python' },
  ruby:   { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Ruby' },
  luau:   { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'Luau' },
  bash:   { bg: '#f8fafc', color: '#334155', border: '#cbd5e1', label: 'Bash' },
};
function langBadge(lang) {
  const c = LANG_COLORS[lang] || LANG_COLORS.node;
  return `<span style="font-size:10px;padding:2px 8px;border-radius:999px;background:${c.bg};color:${c.color};border:1px solid ${c.border};font-weight:600;">${c.label}</span>`;
}

function toolingListPage({ tools, msg }) {
  const esc = (s) => !s ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const msgHtml = msg
    ? `<div class="msg ${msg.type === 'error' ? 'msg-err' : 'msg-ok'}">${esc(msg.text)}</div>`
    : '';

  const toolsHtml = tools.length === 0
    ? '<div class="empty">No tools yet. Create one to get started.</div>'
    : tools.map(t => {
      const statusCls = t._status === 'running' ? 'st-running' : (t.last_exit_code === 0 ? 'st-ok' : (t.last_exit_code != null ? 'st-err' : 'st-idle'));
      const statusLabel = t._status === 'running' ? 'Running' : (t.last_exit_code === 0 ? 'Completed' : (t.last_exit_code != null ? 'Error (exit ' + t.last_exit_code + ')' : 'Never run'));
      const cmdBadge = t.run_command ? `<span class="cmd-badge">${esc(t.run_command)}</span>` : '<span class="cmd-badge dim">no run command</span>';
      return `
      <a href="/admin/tooling/${t.id}" class="tool-card">
        <div class="tool-top">
          <span class="tool-name">${esc(t.name)}</span>
          <div style="display:flex;gap:6px;align-items:center;">
            ${langBadge(t.language)}
            ${t.webapp_enabled ? '<span style="font-size:10px;padding:2px 8px;border-radius:999px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;font-weight:600;">🌐 Web App</span>' : ''}
            <span class="status-pill ${statusCls}">${statusLabel}</span>
          </div>
        </div>
        <div class="tool-cmd">${cmdBadge}</div>
        <div class="tool-desc">${esc(t.description) || 'No description'}</div>
        <div class="tool-meta">
          ${t.last_run_at ? 'Last run: ' + new Date(t.last_run_at).toLocaleString() : 'Never run'}
          · Created by ${esc(t.created_by) || 'admin'}
        </div>
      </a>`;
    }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tooling</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card { background:white; padding:22px 24px; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 10px 25px rgba(15,23,42,0.08); width:100%; max-width:800px; }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      a { text-decoration:none; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; font-size:12px; color:#6b7280; }
      .msg { padding:8px 14px; border-radius:10px; margin-bottom:12px; font-size:13px; }
      .msg-ok { background:#d1fae5; color:#065f46; }
      .msg-err { background:#fee2e2; color:#991b1b; }
      .create-row { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; align-items:flex-end; }
      .create-row input { padding:7px 10px; border-radius:10px; border:1px solid #d1d5db; font-family:inherit; font-size:13px; }
      .btn { padding:7px 14px; border-radius:999px; border:none; background:#00a2ff; color:white; font-weight:500; cursor:pointer; font-size:13px; }
      .tool-card {
        display:block; border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px;
        margin-bottom:8px; background:#fafbfc; color:inherit; transition:border-color .15s;
      }
      .tool-card:hover { border-color:#00a2ff; text-decoration:none; }
      .tool-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .tool-name { font-size:14px; font-weight:600; }
      .status-pill { font-size:11px; font-weight:600; padding:2px 10px; border-radius:999px; }
      .st-running { background:#dbeafe; color:#1d4ed8; }
      .st-ok { background:#d1fae5; color:#065f46; }
      .st-err { background:#fee2e2; color:#991b1b; }
      .st-idle { background:#f3f4f6; color:#6b7280; }
      .tool-cmd { margin-bottom:4px; }
      .cmd-badge { font-size:11px; font-family:'Cascadia Code','Fira Code',monospace; padding:2px 8px; border-radius:6px; background:#f0f9ff; color:#0369a1; }
      .cmd-badge.dim { background:#f3f4f6; color:#9ca3af; }
      .tool-desc { font-size:12px; color:#6b7280; margin-bottom:4px; }
      .tool-meta { font-size:11px; color:#9ca3af; }
      .empty { text-align:center; padding:40px 0; color:#9ca3af; font-size:14px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/admin/panel">⬅ Back to Admin Panel</a></div>
        <h1>Tooling</h1>
        <p class="sub">Create multi-file projects. Run any language. Git clone repos. Admin only.</p>
        ${msgHtml}
        <form method="POST" action="/admin/tooling" class="create-row">
          <div>
            <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Name</label>
            <input type="text" name="name" placeholder="e.g. Deploy Script" required style="width:200px;" />
          </div>
          <div>
            <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Description</label>
            <input type="text" name="description" placeholder="Optional" style="width:240px;" />
          </div>
          <div>
            <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Language</label>
            <select name="language" style="width:130px;padding:7px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;">
              <option value="node">Node.js</option>
              <option value="python">Python</option>
              <option value="ruby">Ruby</option>
              <option value="luau">Luau</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <button type="submit" class="btn">+ New Tool</button>
        </form>
        ${toolsHtml}
      </div>
    </div>
  </body>
  </html>
  `;
}

function toolingEditorPage({ tool, runs, msg, runningStatus }) {
  const esc = (s) => !s ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  let secrets = {};
  try { secrets = JSON.parse(tool.secrets || '{}'); } catch (e) {}
  const secretRows = Object.entries(secrets).map(([k, v]) =>
    `<div class="secret-row">
      <input type="text" name="secret_key" value="${esc(k)}" placeholder="KEY" class="secret-input" />
      <input type="text" name="secret_val" value="${esc(v)}" placeholder="value" class="secret-input secret-val" />
      <button type="button" class="rm-btn" onclick="this.parentElement.remove()">✕</button>
    </div>`
  ).join('');

  const isRunning = runningStatus === 'running';

  const statusCls = isRunning ? 'st-running' : (tool.last_exit_code === 0 ? 'st-ok' : (tool.last_exit_code != null ? 'st-err' : 'st-idle'));
  const statusLabel = isRunning ? 'Running' : (tool.last_exit_code === 0 ? 'Completed' : (tool.last_exit_code != null ? 'Error (exit ' + tool.last_exit_code + ')' : 'Never run'));

  const runsHtml = (runs || []).map(r => {
    const sCls = r.status === 'running' ? 'st-running' : (r.exit_code === 0 ? 'st-ok' : (r.exit_code != null ? 'st-err' : 'st-idle'));
    return `<div class="run-row">
      <span class="status-pill ${sCls}" style="min-width:70px;text-align:center;">${esc(r.status)}</span>
      <span style="font-size:11px;color:#6b7280;">${r.started_at ? new Date(r.started_at).toLocaleString() : '—'}</span>
      <span style="font-size:11px;color:#9ca3af;">${r.exit_code != null ? 'exit ' + r.exit_code : ''}</span>
      <a href="/admin/tooling/${tool.id}/runs/${r.id}" style="font-size:11px;color:#00a2ff;">View Output</a>
    </div>`;
  }).join('');

  const msgHtml = msg
    ? `<div class="msg ${msg.type === 'error' ? 'msg-err' : 'msg-ok'}">${esc(msg.text)}</div>`
    : '';

  const runCmd = esc(tool.run_command || '');
  const webappEnabled = tool.webapp_enabled ? true : false;
  const webappDir = esc(tool.webapp_dir || '');
  const webappPublic = tool.webapp_public ? true : false;
  const webappUrl = '/toolingapp/' + encodeURIComponent(tool.name) + '/';
  const webappPort = 10000 + tool.id;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${esc(tool.name)} – Tooling</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card { background:white; padding:22px 24px; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 10px 25px rgba(15,23,42,0.08); width:100%; max-width:1100px; }
      h1 { margin:0 0 4px; font-size:20px; display:flex; align-items:center; gap:10px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      a { text-decoration:none; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; font-size:12px; color:#6b7280; }
      .msg { padding:8px 14px; border-radius:10px; margin-bottom:12px; font-size:13px; }
      .msg-ok { background:#d1fae5; color:#065f46; }
      .msg-err { background:#fee2e2; color:#991b1b; }
      .status-pill { font-size:11px; font-weight:600; padding:2px 10px; border-radius:999px; display:inline-block; }
      .st-running { background:#dbeafe; color:#1d4ed8; }
      .st-ok { background:#d1fae5; color:#065f46; }
      .st-err { background:#fee2e2; color:#991b1b; }
      .st-idle { background:#f3f4f6; color:#6b7280; }

      .tabs { display:flex; gap:0; margin-bottom:14px; border-bottom:2px solid #e5e7eb; }
      .tab { padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; border:none; background:none; color:#6b7280; border-bottom:2px solid transparent; margin-bottom:-2px; }
      .tab.active { color:#00a2ff; border-bottom-color:#00a2ff; }
      .tab-panel { display:none; }
      .tab-panel.active { display:block; }

      /* File explorer */
      .files-layout { display:flex; gap:0; min-height:460px; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
      .file-sidebar { width:220px; flex-shrink:0; background:#fafbfc; border-right:1px solid #e5e7eb; display:flex; flex-direction:column; }
      .file-toolbar { padding:6px 8px; border-bottom:1px solid #e5e7eb; display:flex; gap:4px; flex-wrap:wrap; }
      .file-toolbar button { font-size:11px; padding:3px 8px; border:1px solid #d1d5db; border-radius:6px; background:white; cursor:pointer; color:#374151; }
      .file-toolbar button:hover { background:#e5e7eb; }
      .file-list { flex:1; overflow-y:auto; }
      .file-item { padding:5px 10px; font-size:12px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-left:3px solid transparent; }
      .file-item:hover { background:#e5e7eb; }
      .file-item.active { background:#dbeafe; border-left-color:#00a2ff; font-weight:500; }
      .file-item.is-dir { color:#6b7280; cursor:default; font-weight:500; }
      .file-editor { flex:1; display:flex; flex-direction:column; min-width:0; }
      .file-editor-header { padding:8px 12px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#fafbfc; }
      .file-editor-path { font-size:12px; font-weight:500; color:#374151; font-family:'Cascadia Code','Fira Code',monospace; }
      .file-editor-area { flex:1; display:flex; flex-direction:column; }
      .file-editor-area .CodeMirror { flex:1; }
      .file-empty { flex:1; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:13px; }

      .editor-area {
        width:100%; min-height:400px; padding:14px 16px; font-family:'Cascadia Code','Fira Code',monospace;
        font-size:13px; line-height:1.6; border:1px solid #e5e7eb; border-radius:10px;
        background:#1e1e2e; color:#cdd6f4; resize:vertical; tab-size:2;
      }
      .btn-row { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; align-items:center; }
      .btn { padding:8px 16px; border-radius:999px; border:none; font-weight:500; cursor:pointer; font-size:13px; }
      .btn-sm { padding:5px 12px; font-size:12px; }
      .btn-primary { background:#00a2ff; color:white; }
      .btn-success { background:#10b981; color:white; }
      .btn-danger { background:#ef4444; color:white; }
      .btn-ghost { background:#f3f4f6; color:#374151; border:1px solid #d1d5db; }

      .console-output {
        background:#0f0f17; color:#a6e3a1; padding:14px 16px; border-radius:10px;
        font-family:'Cascadia Code','Fira Code',monospace; font-size:12px; line-height:1.6;
        min-height:200px; max-height:500px; overflow:auto; white-space:pre-wrap; word-break:break-all;
        margin-top:10px; border:1px solid #1e1e2e;
      }
      .console-output .stderr { color:#f38ba8; }

      .secrets-area { margin-top:8px; }
      .secret-row { display:flex; gap:6px; align-items:center; margin-bottom:6px; }
      .secret-input { padding:6px 10px; border-radius:8px; border:1px solid #d1d5db; font-family:inherit; font-size:13px; width:180px; }
      .secret-val { flex:1; }
      .rm-btn { border:none; background:none; color:#b91c1c; cursor:pointer; font-size:14px; padding:2px 6px; }
      .add-secret-btn { font-size:12px; color:#00a2ff; cursor:pointer; background:none; border:none; padding:4px 0; font-weight:500; }

      .run-row { display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid #f3f4f6; }

      .settings-group { margin-bottom:18px; }
      .settings-group label { font-size:12px; font-weight:500; display:block; margin-bottom:3px; }
      .settings-group input { padding:7px 10px; border-radius:10px; border:1px solid #d1d5db; font-family:inherit; font-size:13px; width:100%; box-sizing:border-box; }
      .settings-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
      .settings-row > div { flex:1; min-width:180px; }
      .section-divider { margin:18px 0; border:none; border-top:1px solid #e5e7eb; }

      .cmd-row { display:flex; gap:8px; margin-top:10px; }
      .cmd-input { flex:1; padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; font-family:'Cascadia Code','Fira Code',monospace; font-size:13px; }
      .run-cmd-display { font-family:'Cascadia Code','Fira Code',monospace; font-size:12px; color:#6b7280; margin-left:8px; }
      .file-editor-area .CodeMirror { height:100%; font-family:'Cascadia Code','Fira Code','JetBrains Mono',monospace; font-size:13px; line-height:1.6; }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/theme/material-darker.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/javascript/javascript.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/python/python.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/ruby/ruby.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/shell/shell.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/lua/lua.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/htmlmixed/htmlmixed.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/xml/xml.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/css/css.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/markdown/markdown.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/yaml/yaml.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/sql/sql.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/clike/clike.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/edit/matchbrackets.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/edit/closebrackets.min.js"><\/script>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/admin/tooling">⬅ Back to Tooling</a></div>
        ${msgHtml}

        <h1>
          ${esc(tool.name)}
          ${langBadge(tool.language)}
          <span class="status-pill ${statusCls}">${statusLabel}</span>
          ${webappEnabled ? '<a href="' + webappUrl + '" target="_blank" style="font-size:12px;font-weight:500;padding:3px 10px;border-radius:999px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;text-decoration:none;margin-left:4px;">🌐 Web App</a>' : ''}
        </h1>
        <p class="sub">${esc(tool.description) || 'No description'}</p>

        <div class="tabs">
          <button class="tab active" onclick="switchTab('files',this)">Files</button>
          <button class="tab" onclick="switchTab('secrets',this)">Secrets</button>
          <button class="tab" onclick="switchTab('console',this)">Console</button>
          <button class="tab" onclick="switchTab('packages',this)">Packages</button>
          <button class="tab" onclick="switchTab('runs',this)">Run History</button>
          <button class="tab" onclick="switchTab('settings',this)">Settings</button>
        </div>

        <!-- FILES TAB -->
        <div id="tab-files" class="tab-panel active">
          <div class="files-layout">
            <div class="file-sidebar">
              <div class="file-toolbar">
                <button onclick="createFilePrompt()">+ File</button>
                <button onclick="createFolderPrompt()">+ Folder</button>
                <button onclick="deleteSelectedFile()" id="btnDeleteFile" style="color:#b91c1c;" disabled>🗑</button>
                <span style="flex:1;"></span>
                <button onclick="exportProject()" title="Export as ZIP">⬇ Export</button>
                <button onclick="document.getElementById('importZipInput').click()" title="Import ZIP">⬆ Import</button>
                <input type="file" id="importZipInput" accept=".zip" style="display:none;" onchange="importProject(this)" />
              </div>
              <div class="file-list" id="fileList">
                <div style="padding:12px;color:#9ca3af;font-size:12px;">Loading…</div>
              </div>
            </div>
            <div class="file-editor">
              <div class="file-editor-header">
                <span class="file-editor-path" id="editorPath">No file selected</span>
                <div style="display:flex;gap:6px;">
                  <span id="dirtyIndicator" style="font-size:11px;color:#f59e0b;display:none;">● unsaved</span>
                  <button class="btn btn-primary btn-sm" onclick="saveCurrentFile()" id="btnSave" disabled>Save</button>
                </div>
              </div>
              <div class="file-editor-area" id="editorArea">
                <div class="file-empty">Select a file to edit, or create a new one.</div>
              </div>
            </div>
          </div>
          <div class="btn-row">
            <button type="button" class="btn btn-success" onclick="runTool()">▶ Run</button>
            ${isRunning ? `<button type="button" class="btn btn-danger" onclick="stopTool()">■ Stop</button>` : ''}
            <span class="run-cmd-display">${runCmd ? '$ ' + runCmd : '(no run command — set in Settings)'}</span>
          </div>
        </div>

        <!-- SECRETS TAB -->
        <div id="tab-secrets" class="tab-panel">
          <p style="font-size:13px;color:#6b7280;margin:0 0 10px;">Secrets are injected as environment variables when your tool runs.</p>
          <form method="POST" action="/admin/tooling/${tool.id}/secrets">
            <div id="secretsList" class="secrets-area">
              ${secretRows}
            </div>
            <button type="button" class="add-secret-btn" onclick="addSecret()">+ Add Secret</button>
            <div class="btn-row">
              <button type="submit" class="btn btn-primary">Save Secrets</button>
            </div>
          </form>
        </div>

        <!-- CONSOLE TAB -->
        <div id="tab-console" class="tab-panel">
          <div id="consoleOutput" class="console-output">Ready.\n</div>
          <div class="btn-row">
            <button type="button" class="btn btn-success" onclick="runTool()">▶ Run</button>
            ${isRunning ? `<button type="button" class="btn btn-danger" onclick="stopTool()">■ Stop</button>` : ''}
            <button type="button" class="btn btn-ghost" onclick="clearConsole()">Clear</button>
          </div>
          <form onsubmit="sendCommand(event)" class="cmd-row">
            <input type="text" id="cmdInput" class="cmd-input" placeholder="Run a shell command in project dir…" autocomplete="off" />
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>

        <!-- PACKAGES TAB -->
        <div id="tab-packages" class="tab-panel">
          <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Install packages into this tool's project directory (npm) or system-wide (pip/luarocks).</p>
          <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px;">
            <div>
              <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Ecosystem</label>
              <select id="pkgEcosystem" style="padding:7px 10px;border-radius:10px;border:1px solid #d1d5db;font-size:13px;font-family:inherit;">
                <option value="npm">npm (Node.js)</option>
                <option value="pip">pip (Python)</option>
                <option value="luarocks">luarocks (Lua)</option>
              </select>
            </div>
            <div style="flex:1;min-width:180px;">
              <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Package name</label>
              <input type="text" id="pkgName" placeholder="e.g. lodash, requests, luasocket" style="width:100%;padding:7px 10px;border-radius:10px;border:1px solid #d1d5db;font-size:13px;font-family:inherit;box-sizing:border-box;" />
            </div>
            <button type="button" class="btn btn-primary" onclick="installPackage()">Install</button>
            <button type="button" class="btn btn-ghost" onclick="listPackages()">List Installed</button>
          </div>
          <div id="pkgConsole" class="console-output" style="min-height:150px;">Ready.\n</div>
        </div>

        <!-- RUN HISTORY TAB -->
        <div id="tab-runs" class="tab-panel">
          ${runsHtml || '<div style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">No runs yet.</div>'}
        </div>

        <!-- SETTINGS TAB -->
        <div id="tab-settings" class="tab-panel">
          <form method="POST" action="/admin/tooling/${tool.id}/settings">
            <div class="settings-row">
              <div><label>Name</label><input type="text" name="name" value="${esc(tool.name)}" required /></div>
              <div><label>Description</label><input type="text" name="description" value="${esc(tool.description)}" /></div>
            </div>
            <div class="settings-group">
              <label>Run Command</label>
              <input type="text" name="run_command" value="${runCmd}" placeholder="e.g. node index.js, python main.py, luau main.luau" style="font-family:'Cascadia Code','Fira Code',monospace;" />
              <div style="font-size:11px;color:#9ca3af;margin-top:4px;">The command executed when you click ▶ Run. Runs in the project directory. <code>luau</code>, <code>node</code>, <code>python</code> etc. are all available.</div>
            </div>
            <div class="settings-group">
              <label>GitHub Token <span style="font-weight:400;color:#9ca3af;">(for private repos)</span></label>
              <div style="display:flex;gap:8px;align-items:center;">
                <input type="password" name="github_token" id="settingsGitToken" value="${esc(tool.github_token)}" placeholder="ghp_xxxxxxxxxxxx" style="flex:1;max-width:400px;padding:7px 10px;border-radius:10px;border:1px solid #d1d5db;font-size:13px;font-family:'Cascadia Code','Fira Code',monospace;box-sizing:border-box;" />
                <button type="button" class="btn btn-ghost btn-sm" onclick="var i=document.getElementById('settingsGitToken');i.type=i.type==='password'?'text':'password'">👁</button>
              </div>
              <div style="font-size:11px;color:#9ca3af;margin-top:4px;">Saved with settings. Generate a <a href="https://github.com/settings/tokens" target="_blank" style="color:#00a2ff;">Personal Access Token</a> with <code>repo</code> scope.</div>
            </div>

            <hr class="section-divider" style="margin:14px 0;" />

            <h3 style="font-size:14px;margin:0 0 8px;">Web App Hosting</h3>
            <p style="font-size:12px;color:#6b7280;margin:0 0 10px;">When running, requests to <code>/toolingapp/${esc(tool.name)}/</code> proxy to your server on port <strong>${webappPort}</strong> (<code>process.env.PORT</code>). When stopped, static files are served instead.</p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                <input type="checkbox" name="webapp_enabled" value="1" ${webappEnabled ? 'checked' : ''} onchange="document.getElementById('webappSettingsArea').style.display=this.checked?'block':'none'" />
                Enable Web App
              </label>
              ${webappEnabled ? '<a href="' + webappUrl + '" target="_blank" style="font-size:12px;color:#00a2ff;">Open →</a>' : ''}
            </div>
            <div id="webappSettingsArea" style="display:${webappEnabled ? 'block' : 'none'};">
              <div style="margin-bottom:10px;">
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                  <input type="checkbox" name="webapp_public" value="1" ${webappPublic ? 'checked' : ''} />
                  Public Access <span style="font-weight:400;color:#9ca3af;font-size:11px;">(accessible without login)</span>
                </label>
              </div>
              <div class="settings-group" style="margin-bottom:0;">
                <label style="font-size:12px;font-weight:500;">Public Directory <span style="font-weight:400;color:#9ca3af;">(optional)</span></label>
                <input type="text" name="webapp_dir" value="${webappDir}" placeholder="e.g. public, dist, build (leave empty for project root)" style="padding:7px 10px;border-radius:10px;border:1px solid #d1d5db;font-size:13px;font-family:'Cascadia Code','Fira Code',monospace;width:100%;box-sizing:border-box;" />
                <div style="font-size:11px;color:#9ca3af;margin-top:4px;">Subdirectory within the project to serve. Leave empty to serve the entire project root.</div>
              </div>
            </div>

            <div class="btn-row" style="margin-top:14px;">
              <button type="submit" class="btn btn-primary">Save Settings</button>
            </div>
          </form>

          <hr class="section-divider" />

          <h3 style="font-size:14px;margin:0 0 8px;">Git Repository</h3>
          <p style="font-size:12px;color:#6b7280;margin:0 0 10px;">Clone a repo into this project directory, or pull latest changes.</p>
          <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
            <div style="flex:1;min-width:250px;">
              <label style="font-size:12px;font-weight:500;display:block;margin-bottom:3px;">Repository URL</label>
              <input type="text" id="gitUrl" placeholder="https://github.com/user/repo.git" style="width:100%;padding:7px 10px;border-radius:10px;border:1px solid #d1d5db;font-size:13px;font-family:inherit;box-sizing:border-box;" />
            </div>
            <button type="button" class="btn btn-primary" onclick="gitClone()">Clone</button>
            <button type="button" class="btn btn-ghost" onclick="gitPull()">Pull</button>
          </div>
          <div id="gitConsole" class="console-output" style="min-height:80px;max-height:200px;margin-top:10px;display:none;"></div>

          <hr class="section-divider" />

          <h3 style="font-size:14px;margin:0 0 8px;color:#b91c1c;">Danger Zone</h3>
          <form method="POST" action="/admin/tooling/${tool.id}/delete" onsubmit="return confirm('Delete this tool and all its files permanently?')">
            <button type="submit" class="btn btn-danger">Delete Tool</button>
          </form>
        </div>
      </div>
    </div>

    <script>
      var TOOL_ID = ${tool.id};
      var currentFilePath = null;
      var isDirty = false;
      var originalContent = '';
      var cmEditor = null;

      var MODE_MAP = {
        '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.jsx': 'javascript',
        '.ts': 'javascript', '.tsx': 'javascript', '.json': 'application/json',
        '.py': 'python',
        '.rb': 'ruby',
        '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
        '.lua': 'lua', '.luau': 'lua',
        '.html': 'htmlmixed', '.htm': 'htmlmixed', '.svg': 'htmlmixed',
        '.xml': 'xml',
        '.css': 'css', '.scss': 'text/x-scss', '.less': 'text/x-less',
        '.md': 'markdown', '.markdown': 'markdown',
        '.yaml': 'yaml', '.yml': 'yaml',
        '.sql': 'sql',
        '.c': 'text/x-csrc', '.h': 'text/x-csrc',
        '.cpp': 'text/x-c++src', '.hpp': 'text/x-c++src', '.cc': 'text/x-c++src',
        '.java': 'text/x-java', '.cs': 'text/x-csharp',
      };

      function getModeForFile(filePath) {
        var dot = filePath.lastIndexOf('.');
        if (dot === -1) return 'text/plain';
        var ext = filePath.substring(dot).toLowerCase();
        return MODE_MAP[ext] || 'text/plain';
      }

      /* ── Tab switching ── */
      function switchTab(name, btn) {
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        document.getElementById('tab-' + name).classList.add('active');
        if (btn) btn.classList.add('active');
      }

      /* ── Utilities ── */
      function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }

      function escAttr(s) {
        return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;');
      }

      var ansiColors = {
        30:'#585b70',31:'#f38ba8',32:'#a6e3a1',33:'#f9e2af',
        34:'#89b4fa',35:'#cba6f7',36:'#94e2d5',37:'#cdd6f4',
        90:'#6c7086',91:'#f38ba8',92:'#a6e3a1',93:'#f9e2af',
        94:'#89b4fa',95:'#cba6f7',96:'#94e2d5',97:'#ffffff'
      };
      var ansiBgColors = {
        40:'#585b70',41:'#f38ba8',42:'#a6e3a1',43:'#f9e2af',
        44:'#89b4fa',45:'#cba6f7',46:'#94e2d5',47:'#cdd6f4',
        100:'#6c7086',101:'#f38ba8',102:'#a6e3a1',103:'#f9e2af',
        104:'#89b4fa',105:'#cba6f7',106:'#94e2d5',107:'#ffffff'
      };

      function ansiToHtml(raw) {
        var result = '', openTags = 0;
        var re = /\\x1b\\[([0-9;]*)m/g;
        var lastIdx = 0, m;
        while ((m = re.exec(raw)) !== null) {
          result += escHtml(raw.substring(lastIdx, m.index));
          lastIdx = re.lastIndex;
          var parts = m[1] ? m[1].split(';').map(Number) : [0];
          for (var pi = 0; pi < parts.length; pi++) {
            var c = parts[pi];
            if (c === 0) { while (openTags > 0) { result += '</span>'; openTags--; } }
            else {
              var styles = [];
              if (c === 1) styles.push('font-weight:bold');
              if (c === 2) styles.push('opacity:0.7');
              if (c === 3) styles.push('font-style:italic');
              if (c === 4) styles.push('text-decoration:underline');
              if (ansiColors[c]) styles.push('color:' + ansiColors[c]);
              if (ansiBgColors[c]) styles.push('background:' + ansiBgColors[c]);
              if (styles.length) { result += '<span style="' + styles.join(';') + '">'; openTags++; }
            }
          }
        }
        result += escHtml(raw.substring(lastIdx));
        while (openTags > 0) { result += '</span>'; openTags--; }
        return result;
      }

      /* ── Secrets ── */
      function addSecret() {
        var row = document.createElement('div');
        row.className = 'secret-row';
        row.innerHTML = '<input type="text" name="secret_key" placeholder="KEY" class="secret-input" />'
          + '<input type="text" name="secret_val" placeholder="value" class="secret-input secret-val" />'
          + '<button type="button" class="rm-btn" onclick="this.parentElement.remove()">✕</button>';
        document.getElementById('secretsList').appendChild(row);
      }

      /* ── File explorer ── */
      function loadFileList() {
        fetch('/admin/tooling/' + TOOL_ID + '/files')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            renderFileTree(data.files || []);
          })
          .catch(function() {
            document.getElementById('fileList').innerHTML = '<div style="padding:12px;color:#f38ba8;font-size:12px;">Failed to load files</div>';
          });
      }

      function renderFileTree(files) {
        var html = '';
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          var depth = (f.path.match(/\\//g) || []).length;
          var pad = 10 + depth * 14;
          var icon = f.isDir ? '📁' : '📄';
          var cls = 'file-item';
          if (f.isDir) cls += ' is-dir';
          if (f.path === currentFilePath) cls += ' active';
          if (f.isDir) {
            html += '<div class="' + cls + '" style="padding-left:' + pad + 'px">' + icon + ' ' + escHtml(f.name) + '</div>';
          } else {
            html += '<div class="' + cls + '" style="padding-left:' + pad + 'px" data-path="' + escAttr(f.path) + '" onclick="openFileClick(this)">' + icon + ' ' + escHtml(f.name) + '</div>';
          }
        }
        document.getElementById('fileList').innerHTML = html || '<div style="padding:12px;color:#9ca3af;font-size:12px;">No files yet. Create one!</div>';
      }

      function openFileClick(el) {
        var p = el.getAttribute('data-path');
        if (isDirty && !confirm('You have unsaved changes. Discard them?')) return;
        openFile(p);
      }

      function openFile(filePath) {
        fetch('/admin/tooling/' + TOOL_ID + '/file?path=' + encodeURIComponent(filePath))
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert(data.error); return; }
            currentFilePath = filePath;
            originalContent = data.content;
            isDirty = false;
            document.getElementById('editorPath').textContent = filePath;
            document.getElementById('dirtyIndicator').style.display = 'none';
            document.getElementById('btnSave').disabled = false;
            document.getElementById('btnDeleteFile').disabled = false;

            // Destroy old editor if exists
            if (cmEditor) { cmEditor.toTextArea(); cmEditor = null; }
            document.getElementById('editorArea').innerHTML = '<textarea id="codeEditor"></textarea>';
            cmEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
              mode: getModeForFile(filePath),
              theme: 'material-darker',
              lineNumbers: true,
              tabSize: 2,
              indentWithTabs: false,
              matchBrackets: true,
              autoCloseBrackets: true,
              lineWrapping: false,
              extraKeys: {
                'Ctrl-S': function() { saveCurrentFile(); },
                'Cmd-S': function() { saveCurrentFile(); },
                'Tab': function(cm) {
                  if (cm.somethingSelected()) { cm.indentSelection('add'); }
                  else { cm.replaceSelection('  ', 'end'); }
                },
              }
            });
            cmEditor.setValue(data.content);
            cmEditor.on('change', function() { markDirty(); });
            cmEditor.clearHistory();

            // Highlight active file in sidebar
            document.querySelectorAll('.file-item').forEach(function(el) { el.classList.remove('active'); });
            var items = document.querySelectorAll('.file-item');
            items.forEach(function(el) { if (el.getAttribute('data-path') === filePath) el.classList.add('active'); });
          })
          .catch(function(e) { alert('Failed to open file: ' + e); });
      }

      function markDirty() {
        if (!cmEditor) return;
        isDirty = cmEditor.getValue() !== originalContent;
        document.getElementById('dirtyIndicator').style.display = isDirty ? 'inline' : 'none';
      }

      function saveCurrentFile() {
        if (!currentFilePath || !cmEditor) return;
        var content = cmEditor.getValue();
        fetch('/admin/tooling/' + TOOL_ID + '/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentFilePath, content: content })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert('Save failed: ' + data.error); return; }
            originalContent = content;
            isDirty = false;
            document.getElementById('dirtyIndicator').style.display = 'none';
          })
          .catch(function(e) { alert('Save failed: ' + e); });
      }

      function createFilePrompt() {
        var name = prompt('New file name (e.g. index.js, lib/utils.py):');
        if (!name || !name.trim()) return;
        fetch('/admin/tooling/' + TOOL_ID + '/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: name.trim(), content: '' })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert(data.error); return; }
            loadFileList();
            openFile(name.trim());
          })
          .catch(function(e) { alert('Failed: ' + e); });
      }

      function createFolderPrompt() {
        var name = prompt('New folder name (e.g. lib, src/utils):');
        if (!name || !name.trim()) return;
        fetch('/admin/tooling/' + TOOL_ID + '/file/mkdir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: name.trim() })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert(data.error); return; }
            loadFileList();
          })
          .catch(function(e) { alert('Failed: ' + e); });
      }

      function deleteSelectedFile() {
        if (!currentFilePath) return;
        if (!confirm('Delete "' + currentFilePath + '"?')) return;
        fetch('/admin/tooling/' + TOOL_ID + '/file/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentFilePath })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert(data.error); return; }
            currentFilePath = null;
            isDirty = false;
            if (cmEditor) { cmEditor.toTextArea(); cmEditor = null; }
            document.getElementById('editorPath').textContent = 'No file selected';
            document.getElementById('editorArea').innerHTML = '<div class="file-empty">Select a file to edit, or create a new one.</div>';
            document.getElementById('btnSave').disabled = true;
            document.getElementById('btnDeleteFile').disabled = true;
            document.getElementById('dirtyIndicator').style.display = 'none';
            loadFileList();
          })
          .catch(function(e) { alert('Failed: ' + e); });
      }

      function exportProject() {
        window.location.href = '/admin/tooling/' + TOOL_ID + '/export';
      }

      function importProject(input) {
        if (!input.files || !input.files[0]) return;
        var file = input.files[0];
        if (!file.name.endsWith('.zip')) { alert('Please select a .zip file'); input.value = ''; return; }
        if (!confirm('Import "' + file.name + '"? This will overwrite any files with the same names.')) { input.value = ''; return; }
        var form = new FormData();
        form.append('toolZip', file);
        fetch('/admin/tooling/' + TOOL_ID + '/import', { method: 'POST', body: form })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert('Import failed: ' + data.error); }
            else { loadFileList(); alert('Imported ' + data.count + ' entries successfully.'); }
            input.value = '';
          })
          .catch(function(e) { alert('Import failed: ' + e); input.value = ''; });
      }

      /* ── Console ── */
      var pollTimer = null;

      function appendConsole(text, isErr) {
        var el = document.getElementById('consoleOutput');
        if (isErr) {
          el.innerHTML += '<span class="stderr">' + ansiToHtml(text) + '</span>';
        } else {
          el.innerHTML += ansiToHtml(text);
        }
        el.scrollTop = el.scrollHeight;
      }

      function clearConsole() {
        document.getElementById('consoleOutput').innerHTML = '';
      }

      function runTool() {
        switchTab('console', document.querySelectorAll('.tab')[2]);
        clearConsole();
        appendConsole('Starting tool...\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/run', { method: 'POST' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendConsole('Error: ' + data.error + '\\n', true); return; }
            appendConsole('Run #' + data.run_id + ' started.\\n');
            pollOutput(data.run_id);
          })
          .catch(function(e) { appendConsole('Request failed: ' + e + '\\n', true); });
      }

      function stopTool() {
        fetch('/admin/tooling/' + TOOL_ID + '/stop', { method: 'POST' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            appendConsole('\\n' + (data.message || 'Stop signal sent.') + '\\n');
          })
          .catch(function(e) { appendConsole('Stop failed: ' + e + '\\n', true); });
      }

      var lastLen = 0;
      function pollOutput(runId) {
        if (pollTimer) clearInterval(pollTimer);
        lastLen = 0;
        pollTimer = setInterval(function() {
          fetch('/admin/tooling/' + TOOL_ID + '/runs/' + runId + '/stream?offset=' + lastLen)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.chunk) { appendConsole(data.chunk); lastLen = data.offset; }
              if (data.status !== 'running') {
                clearInterval(pollTimer);
                pollTimer = null;
                if (data.exit_code != null) {
                  appendConsole('\\nProcess exited with code ' + data.exit_code + '\\n');
                }
              }
            })
            .catch(function() { clearInterval(pollTimer); pollTimer = null; });
        }, 500);
      }

      function sendCommand(e) {
        e.preventDefault();
        var input = document.getElementById('cmdInput');
        var cmd = input.value.trim();
        if (!cmd) return;
        input.value = '';
        appendConsole('$ ' + cmd + '\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/exec', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({command: cmd})
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendConsole('Error: ' + data.error + '\\n', true); return; }
            appendConsole('Command started, run #' + data.run_id + '\\n');
            pollOutput(data.run_id);
          })
          .catch(function(e) { appendConsole('Request failed: ' + e + '\\n', true); });
      }

      /* ── Package manager ── */
      var pkgPollTimer = null;

      function appendPkgConsole(text) {
        var el = document.getElementById('pkgConsole');
        el.innerHTML += ansiToHtml(text);
        el.scrollTop = el.scrollHeight;
      }

      function installPackage() {
        var eco = document.getElementById('pkgEcosystem').value;
        var pkg = document.getElementById('pkgName').value.trim();
        if (!pkg) return;
        document.getElementById('pkgConsole').innerHTML = '';
        appendPkgConsole('Installing ' + pkg + ' via ' + eco + '...\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/install-package', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ ecosystem: eco, package: pkg })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendPkgConsole('Error: ' + data.error + '\\n'); return; }
            appendPkgConsole('Run #' + data.run_id + ' started.\\n');
            pollPkgOutput(data.run_id);
          })
          .catch(function(e) { appendPkgConsole('Request failed: ' + e + '\\n'); });
      }

      function listPackages() {
        var eco = document.getElementById('pkgEcosystem').value;
        var cmd;
        if (eco === 'pip') cmd = 'pip list';
        else if (eco === 'luarocks') cmd = 'luarocks list';
        else cmd = 'npm list --depth=0';
        document.getElementById('pkgConsole').innerHTML = '';
        appendPkgConsole('$ ' + cmd + '\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/exec', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ command: cmd })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendPkgConsole('Error: ' + data.error + '\\n'); return; }
            pollPkgOutput(data.run_id);
          })
          .catch(function(e) { appendPkgConsole('Request failed: ' + e + '\\n'); });
      }

      var pkgLastLen = 0;
      function pollPkgOutput(runId) {
        if (pkgPollTimer) clearInterval(pkgPollTimer);
        pkgLastLen = 0;
        pkgPollTimer = setInterval(function() {
          fetch('/admin/tooling/' + TOOL_ID + '/runs/' + runId + '/stream?offset=' + pkgLastLen)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.chunk) { appendPkgConsole(data.chunk); pkgLastLen = data.offset; }
              if (data.status !== 'running') {
                clearInterval(pkgPollTimer); pkgPollTimer = null;
                if (data.exit_code != null) { appendPkgConsole('\\nDone (exit code ' + data.exit_code + ')\\n'); }
              }
            })
            .catch(function() { clearInterval(pkgPollTimer); pkgPollTimer = null; });
        }, 500);
      }

      /* ── Git ── */
      var gitPollTimer = null;

      function appendGitConsole(text) {
        var el = document.getElementById('gitConsole');
        el.style.display = 'block';
        el.innerHTML += ansiToHtml(text);
        el.scrollTop = el.scrollHeight;
      }

      function gitClone() {
        var url = document.getElementById('gitUrl').value.trim();
        if (!url) { alert('Enter a repository URL'); return; }
        document.getElementById('gitConsole').innerHTML = '';
        document.getElementById('gitConsole').style.display = 'block';
        appendGitConsole('Cloning ' + url + '...\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/git', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ url: url })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendGitConsole('Error: ' + data.error + '\\n'); return; }
            pollGitOutput(data.run_id);
          })
          .catch(function(e) { appendGitConsole('Request failed: ' + e + '\\n'); });
      }

      function gitPull() {
        document.getElementById('gitConsole').innerHTML = '';
        document.getElementById('gitConsole').style.display = 'block';
        appendGitConsole('Pulling latest...\\n');
        fetch('/admin/tooling/' + TOOL_ID + '/git', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ action: 'pull' })
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { appendGitConsole('Error: ' + data.error + '\\n'); return; }
            pollGitOutput(data.run_id);
          })
          .catch(function(e) { appendGitConsole('Request failed: ' + e + '\\n'); });
      }

      var gitLastLen = 0;
      function pollGitOutput(runId) {
        if (gitPollTimer) clearInterval(gitPollTimer);
        gitLastLen = 0;
        gitPollTimer = setInterval(function() {
          fetch('/admin/tooling/' + TOOL_ID + '/runs/' + runId + '/stream?offset=' + gitLastLen)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.chunk) { appendGitConsole(data.chunk); gitLastLen = data.offset; }
              if (data.status !== 'running') {
                clearInterval(gitPollTimer); gitPollTimer = null;
                if (data.exit_code != null) {
                  appendGitConsole('\\nDone (exit code ' + data.exit_code + ')\\n');
                }
                loadFileList(); // Refresh file tree after git operation
              }
            })
            .catch(function() { clearInterval(gitPollTimer); gitPollTimer = null; });
        }, 500);
      }

      /* ── Init ── */
      loadFileList();
    </script>
  </body>
  </html>
  `;
}

function toolRunOutputPage({ tool, run }) {
  const esc = (s) => !s ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const sCls = run.status === 'running' ? 'st-running' : (run.exit_code === 0 ? 'st-ok' : (run.exit_code != null ? 'st-err' : 'st-idle'));

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Run #${run.id} – ${esc(tool.name)}</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card { background:white; padding:22px 24px; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 10px 25px rgba(15,23,42,0.08); width:100%; max-width:1000px; }
      h1 { margin:0 0 8px; font-size:18px; }
      a { text-decoration:none; font-size:12px; color:#6b7280; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; }
      .meta { font-size:12px; color:#6b7280; margin-bottom:12px; }
      .status-pill { font-size:11px; font-weight:600; padding:2px 10px; border-radius:999px; display:inline-block; }
      .st-running { background:#dbeafe; color:#1d4ed8; }
      .st-ok { background:#d1fae5; color:#065f46; }
      .st-err { background:#fee2e2; color:#991b1b; }
      .st-idle { background:#f3f4f6; color:#6b7280; }
      .output {
        background:#0f0f17; color:#a6e3a1; padding:14px 16px; border-radius:10px;
        font-family:'Cascadia Code','Fira Code',monospace; font-size:12px; line-height:1.6;
        overflow:auto; white-space:pre-wrap; word-break:break-all; max-height:600px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/admin/tooling/${tool.id}">⬅ Back to ${esc(tool.name)}</a></div>
        <h1>Run #${run.id} <span class="status-pill ${sCls}">${esc(run.status)}</span></h1>
        <div class="meta">
          Started: ${run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
          · Finished: ${run.finished_at ? new Date(run.finished_at).toLocaleString() : '—'}
          · Exit code: ${run.exit_code != null ? run.exit_code : '—'}
          · Run by: ${esc(run.run_by) || '—'}
        </div>
        <pre class="output" id="runOutput">${esc(run.output) || '(no output)'}</pre>
      </div>
    </div>
    <script>
      (function() {
        var el = document.getElementById('runOutput');
        var raw = el.textContent;
        if (!raw || raw === '(no output)') return;

        var ansiColors = {
          30:'#585b70',31:'#f38ba8',32:'#a6e3a1',33:'#f9e2af',
          34:'#89b4fa',35:'#cba6f7',36:'#94e2d5',37:'#cdd6f4',
          90:'#6c7086',91:'#f38ba8',92:'#a6e3a1',93:'#f9e2af',
          94:'#89b4fa',95:'#cba6f7',96:'#94e2d5',97:'#ffffff'
        };
        var ansiBgColors = {
          40:'#585b70',41:'#f38ba8',42:'#a6e3a1',43:'#f9e2af',
          44:'#89b4fa',45:'#cba6f7',46:'#94e2d5',47:'#cdd6f4'
        };
        function escH(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
        function ansiToHtml(r) {
          var res = '', open = 0, re = /\\x1b\\[([0-9;]*)m/g, li = 0, m;
          while ((m = re.exec(r)) !== null) {
            res += escH(r.substring(li, m.index)); li = re.lastIndex;
            var parts = m[1] ? m[1].split(';').map(Number) : [0];
            for (var i = 0; i < parts.length; i++) {
              var c = parts[i];
              if (c === 0) { while (open > 0) { res += '</span>'; open--; } }
              else {
                var st = [];
                if (c===1) st.push('font-weight:bold');
                if (c===3) st.push('font-style:italic');
                if (c===4) st.push('text-decoration:underline');
                if (ansiColors[c]) st.push('color:'+ansiColors[c]);
                if (ansiBgColors[c]) st.push('background:'+ansiBgColors[c]);
                if (st.length) { res += '<span style="'+st.join(';')+'">'; open++; }
              }
            }
          }
          res += escH(r.substring(li));
          while (open > 0) { res += '</span>'; open--; }
          return res;
        }
        el.innerHTML = ansiToHtml(raw);
      })();
    </script>
  </body>
  </html>
  `;
}

module.exports = {
  toolingListPage,
  toolingEditorPage,
  toolRunOutputPage,
};
