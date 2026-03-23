function logDumpsPage({ categories, selectedCategory, dumps, currentUser }) {
  const catOptions = categories.map(c => {
    const sel = selectedCategory && String(selectedCategory) === String(c.id) ? ' selected' : '';
    return `<option value="${c.id}"${sel}>${escapeAttr(c.name)}</option>`;
  }).join('');

  const catListHtml = categories.length === 0 ? '' : `
    <div class="cat-manage">
      <h3 style="font-size:14px;margin:0 0 8px;">Categories</h3>
      <div class="cat-chips">
        ${categories.map(c => `
          <div class="cat-chip">
            <span>${escapeAttr(c.name)}</span>
            <a href="/log-dumps/category/${c.id}/download" class="chip-btn" title="Download all logs in this category">⬇</a>
            <form method="POST" action="/log-dumps/category/${c.id}/delete" style="display:inline;" onsubmit="return confirm('Delete category \\'${escapeAttr(c.name)}\\' and ALL its logs? This cannot be undone.')">
              <button type="submit" class="chip-btn chip-btn-danger" title="Delete category &amp; all logs">✕</button>
            </form>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const dumpsHtml = dumps.map(d => `
    <div class="dump-card">
      <div class="dump-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="dump-cat">${escapeAttr(d.category_name)}</span>
          <span class="dump-date">${new Date(d.created_at).toLocaleString()}</span>
        </div>
        <div class="dump-actions">
          <a href="/log-dumps/${d.id}/download" class="action-btn" title="Download this log">⬇ Download</a>
          <form method="POST" action="/log-dumps/${d.id}/delete" style="display:inline;" onsubmit="return confirm('Delete this log dump?')">
            <button type="submit" class="action-btn action-btn-danger" title="Delete this log">✕ Delete</button>
          </form>
        </div>
      </div>
      <pre class="dump-content">${escapeAttr(d.log_content)}</pre>
    </div>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Log Dumps</title>
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
        max-width:1000px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      a { text-decoration:none; font-size:12px; color:#6b7280; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; }

      .filter-row {
        display:flex; gap:8px; align-items:center; margin-bottom:16px; flex-wrap:wrap;
      }
      select, .search-input {
        padding:7px 10px; border-radius:10px; border:1px solid #d1d5db;
        font-family:inherit; font-size:13px; background:white;
      }
      .search-input { flex:1; min-width:160px; }
      .filter-btn {
        padding:7px 14px; border-radius:999px; border:none;
        background:#00a2ff; color:white; font-weight:500; cursor:pointer; font-size:13px;
      }
      .filter-btn.secondary { background:#e5e7eb; color:#111827; }

      .dump-card {
        border:1px solid #e5e7eb;
        border-radius:12px;
        padding:14px 16px;
        margin-bottom:10px;
        background:#fafbfc;
      }
      .dump-header {
        display:flex; justify-content:space-between; align-items:center;
        margin-bottom:8px;
      }
      .dump-cat {
        font-size:12px; font-weight:600; color:#00a2ff;
        background:#e0f2ff; padding:2px 10px; border-radius:999px;
      }
      .dump-date { font-size:11px; color:#6b7280; }
      .dump-content {
        background:#1e1e2e; color:#cdd6f4; padding:12px 14px;
        border-radius:8px; font-size:12px; line-height:1.5;
        overflow-x:auto; white-space:pre-wrap; word-break:break-all;
        max-height:400px; overflow-y:auto; margin:0;
      }
      .empty-state {
        text-align:center; padding:40px 0; color:#9ca3af; font-size:14px;
      }
      .pagination {
        display:flex; justify-content:center; gap:6px; margin-top:16px;
      }
      .pagination a, .pagination span {
        padding:5px 12px; border-radius:999px; font-size:12px;
        border:1px solid #d1d5db; color:#374151; text-decoration:none;
      }
      .pagination span.current {
        background:#00a2ff; color:white; border-color:#00a2ff;
      }
      .stats-row {
        display:flex; gap:16px; margin-bottom:14px; flex-wrap:wrap;
      }
      .stat-pill {
        font-size:12px; color:#6b7280; background:#f3f4f6;
        padding:4px 12px; border-radius:999px;
      }
      .stat-pill strong { color:#111827; }

      .cat-manage { margin-bottom:16px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; }
      .cat-chips { display:flex; flex-wrap:wrap; gap:6px; }
      .cat-chip {
        display:inline-flex; align-items:center; gap:4px;
        background:white; border:1px solid #e5e7eb; border-radius:999px;
        padding:4px 10px; font-size:12px; font-weight:500;
      }
      .chip-btn {
        display:inline-flex; align-items:center; justify-content:center;
        width:20px; height:20px; border-radius:50%; border:none;
        background:transparent; cursor:pointer; font-size:11px;
        color:#6b7280; text-decoration:none; padding:0; line-height:1;
      }
      .chip-btn:hover { background:#e5e7eb; }
      .chip-btn-danger { color:#b91c1c; }
      .chip-btn-danger:hover { background:#fee2e2; }

      .dump-actions { display:flex; align-items:center; gap:6px; }
      .action-btn {
        font-size:11px; padding:3px 10px; border-radius:999px;
        border:1px solid #d1d5db; background:white; color:#374151;
        cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:3px;
        font-family:inherit;
      }
      .action-btn:hover { background:#f3f4f6; }
      .action-btn-danger { border-color:#fca5a5; color:#b91c1c; }
      .action-btn-danger:hover { background:#fee2e2; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/">⬅ Back to logs</a></div>
        <h1>Log Dumps</h1>
        <p class="sub">Browse log dumps submitted via API. Filter by category or search content.</p>

        <div class="stats-row">
          <span class="stat-pill"><strong>${dumps.length > 0 ? dumps[0]._total || dumps.length : 0}</strong> total dumps</span>
          <span class="stat-pill"><strong>${categories.length}</strong> categories</span>
        </div>

        <form method="GET" action="/log-dumps" class="filter-row">
          <select name="category">
            <option value="">All Categories</option>
            ${catOptions}
          </select>
          <input type="text" name="search" class="search-input" placeholder="Search log content…" value="${escapeAttr(dumps._search || '')}">
          <button type="submit" class="filter-btn">Filter</button>
          <a href="/log-dumps" class="filter-btn secondary" style="text-decoration:none; font-size:13px;">Clear</a>
        </form>

        ${catListHtml}

        ${dumps.length === 0
          ? '<div class="empty-state">No log dumps found.</div>'
          : dumpsHtml}

        ${dumps._paginationHtml || ''}
      </div>
    </div>
  </body>
  </html>
  `;
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = {
  logDumpsPage,
};
