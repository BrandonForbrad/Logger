function apiKeysPage({ keys, msg }) {
  const esc = (s) => {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  const keysHtml = keys.length === 0
    ? '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:20px;">No API keys yet. Create one above.</td></tr>'
    : keys.map(k => `
      <tr>
        <td><code style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;word-break:break-all;">${esc(k.key)}</code></td>
        <td>${esc(k.label) || '<span style="color:#9ca3af;">—</span>'}</td>
        <td>${esc(k.created_by) || '—'}</td>
        <td>${k.created_at ? new Date(k.created_at).toLocaleDateString() : '—'}</td>
        <td>
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;${k.is_active ? 'background:#d1fae5;color:#065f46;' : 'background:#fee2e2;color:#991b1b;'}">
            ${k.is_active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td>
          <form method="POST" action="/admin/api-keys/${k.id}/toggle" style="display:inline;">
            <button type="submit" style="padding:4px 10px;border-radius:999px;border:1px solid #d1d5db;background:white;cursor:pointer;font-size:11px;">
              ${k.is_active ? 'Disable' : 'Enable'}
            </button>
          </form>
          <form method="POST" action="/admin/api-keys/${k.id}/delete" style="display:inline;margin-left:4px;" onsubmit="return confirm('Delete this API key? This cannot be undone.')">
            <button type="submit" style="padding:4px 10px;border-radius:999px;border:1px solid #fca5a5;background:#fff1f2;color:#b91c1c;cursor:pointer;font-size:11px;">
              Delete
            </button>
          </form>
        </td>
      </tr>
    `).join('');

  const msgHtml = msg
    ? `<div style="padding:8px 14px;border-radius:10px;margin-bottom:12px;font-size:13px;${msg.type === 'error' ? 'background:#fee2e2;color:#991b1b;' : 'background:#d1fae5;color:#065f46;'}">${esc(msg.text)}</div>`
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>API Keys – Admin</title>
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
        max-width:900px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      a { text-decoration:none; font-size:12px; color:#6b7280; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; }

      .create-form {
        display:flex; gap:8px; align-items:flex-end; margin-bottom:18px; flex-wrap:wrap;
      }
      .create-form label { font-size:12px; font-weight:500; display:block; margin-bottom:3px; }
      .create-form input {
        padding:7px 10px; border-radius:10px; border:1px solid #d1d5db;
        font-family:inherit; font-size:13px;
      }
      .create-btn {
        padding:7px 14px; border-radius:999px; border:none;
        background:#00a2ff; color:white; font-weight:500; cursor:pointer; font-size:13px;
      }

      table { width:100%; border-collapse:collapse; font-size:13px; }
      th {
        text-align:left; font-size:11px; font-weight:600; color:#6b7280;
        text-transform:uppercase; letter-spacing:0.5px;
        padding:6px 8px; border-bottom:2px solid #e5e7eb;
      }
      td { padding:8px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }

      .usage-section {
        margin-top:24px; padding-top:18px; border-top:1px solid #e5e7eb;
      }
      .usage-section h2 { font-size:16px; margin:0 0 8px; }
      .usage-section p { font-size:13px; color:#6b7280; margin:0 0 12px; }
      pre.code-block {
        background:#1e1e2e; color:#cdd6f4; padding:14px 16px;
        border-radius:10px; font-size:12px; line-height:1.6;
        overflow-x:auto; white-space:pre; margin:0 0 8px;
      }
      .code-label { font-size:11px; font-weight:600; color:#6b7280; margin:10px 0 4px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/admin/panel">⬅ Back to Admin Panel</a></div>
        <h1>API Keys</h1>
        <p class="sub">Manage API keys used to submit log dumps via the external API.</p>

        ${msgHtml}

        <form method="POST" action="/admin/api-keys" class="create-form">
          <div>
            <label>Label (optional)</label>
            <input type="text" name="label" placeholder="e.g. Production Server" style="width:220px;" />
          </div>
          <button type="submit" class="create-btn">Generate New Key</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Created By</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${keysHtml}
          </tbody>
        </table>

        <div class="usage-section">
          <h2>API Usage</h2>
          <p>Send log dumps to the API with a POST request. Categories are auto-created if they don't exist.</p>

          <div class="code-label">Endpoint</div>
          <pre class="code-block">POST /api/log-dumps</pre>

          <div class="code-label">Headers</div>
          <pre class="code-block">Authorization: Bearer YOUR_API_KEY
Content-Type: application/json</pre>

          <div class="code-label">Body</div>
          <pre class="code-block">{
  "Category": "BattleSystemLogs",
  "Log": "ENTIRE LOG CONTENT HERE"
}</pre>

          <div class="code-label">Response (201)</div>
          <pre class="code-block">{
  "success": true,
  "id": 42,
  "category": "BattleSystemLogs"
}</pre>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  apiKeysPage,
};
