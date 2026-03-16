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
      overflow: hidden;
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

    /* ===== Chat Sidebar Panel ===== */
    .chat-toggle-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #5865f2;
      color: white;
      border: none;
      font-size: 26px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(88,101,242,0.4);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }
    .chat-toggle-btn:hover { background: #4752c4; transform: scale(1.08); }
    .chat-toggle-btn .chat-toggle-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #da373c;
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
      display: none;
    }
    .chat-panel-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 1000;
      display: none;
    }
    .chat-panel-overlay.open { display: block; }
    .chat-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 440px;
      max-width: 100vw;
      background: #1e1f22;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      box-shadow: -4px 0 24px rgba(0,0,0,0.3);
    }
    .chat-panel.open { transform: translateX(0); }
    .chat-section { display: none; }
    .chat-wrapper {
      background: #1e1f22;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
    }
    .chat-header {
      background: #2b2d31;
      padding: 12px 16px;
      border-bottom: 1px solid #3f4147;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .chat-header-icon { font-size: 20px; color: #80848e; }
    .chat-header-title { font-size: 15px; font-weight: 600; color: #f2f3f5; }
    .chat-header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
    .chat-notif-badge {
      background: #da373c;
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
      cursor: pointer;
      position: relative;
    }
    .chat-notif-dropdown {
      display: none;
      position: absolute;
      top: 36px;
      right: 0;
      width: 320px;
      max-height: 340px;
      overflow-y: auto;
      background: #2b2d31;
      border: 1px solid #3f4147;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 1100;
      padding: 6px 0;
    }
    .chat-notif-dropdown.open { display: block; }
    .chat-notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid #3f4147;
      cursor: default;
    }
    .chat-notif-item:last-child { border-bottom: none; }
    .chat-notif-item-body { flex: 1; min-width: 0; }
    .chat-notif-item-sender { font-size: 13px; font-weight: 600; color: #f2f3f5; }
    .chat-notif-item-text { font-size: 12px; color: #b5bac1; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chat-notif-item-context { font-size: 11px; color: #80848e; margin-top: 3px; }
    .chat-notif-goto {
      background: #5865f2;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      align-self: center;
    }
    .chat-notif-goto:hover { background: #4752c4; }
    .chat-notif-empty { padding: 16px; text-align: center; color: #80848e; font-size: 13px; }
    .chat-notif-dropdown::-webkit-scrollbar { width: 5px; }
    .chat-notif-dropdown::-webkit-scrollbar-track { background: transparent; }
    .chat-notif-dropdown::-webkit-scrollbar-thumb { background: #1a1b1e; border-radius: 3px; }
    .chat-msg-highlight { animation: chatMsgFlash 1.5s ease-out; }
    @keyframes chatMsgFlash {
      0%,30% { background: rgba(88,101,242,0.22); }
      100% { background: transparent; }
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: #1a1b1e; border-radius: 3px; }
    .chat-msg-group { display: flex; gap: 12px; padding: 4px 0; }
    .chat-msg-group:hover { background: rgba(0,0,0,0.06); border-radius: 6px; }
    .chat-msg-group.first-in-group { margin-top: 12px; padding-top: 4px; }
    .chat-msg-avatar { flex-shrink: 0; margin-top: 2px; }
    .chat-msg-avatar .avatar { width: 36px; height: 36px; font-size: 14px; line-height: 36px; }
    .chat-msg-body { flex: 1; min-width: 0; }
    .chat-msg-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
    .chat-msg-sender { font-size: 14px; font-weight: 600; cursor: pointer; }
    .chat-msg-sender:hover { text-decoration: underline; }
    .chat-msg-time { font-size: 11px; color: #80848e; }
    .chat-msg-text { font-size: 14px; color: #dbdee1; line-height: 1.45; word-wrap: break-word; white-space: pre-wrap; }
    .chat-msg-text .mention { background: rgba(88,101,242,0.3); color: #c9cdfb; border-radius: 3px; padding: 0 2px; cursor: pointer; font-weight: 500; }
    .chat-msg-text .mention:hover { background: #5865f2; color: white; }
    .chat-msg-edited { font-size: 10px; color: #80848e; margin-left: 4px; }
    .chat-msg-reply-ref {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #80848e;
      margin-bottom: 2px;
      cursor: pointer;
    }
    .chat-msg-reply-ref:hover { color: #dbdee1; }
    .chat-msg-reply-ref .reply-line { width: 2px; height: 12px; background: #80848e; border-radius: 1px; }
    .chat-msg-reply-ref .reply-sender { font-weight: 600; color: #b5bac1; }
    .chat-msg-actions {
      position: absolute;
      right: 12px;
      top: -14px;
      background: #2b2d31;
      border: 1px solid #3f4147;
      border-radius: 6px;
      display: none;
      z-index: 5;
    }
    .chat-msg-group { position: relative; }
    .chat-msg-group:hover .chat-msg-actions { display: flex; }
    .chat-msg-action-btn {
      background: none;
      border: none;
      color: #b5bac1;
      padding: 4px 8px;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
    }
    .chat-msg-action-btn:hover { color: #f2f3f5; background: #36373d; }
    .chat-msg-deleted .chat-msg-text { color: #80848e; font-style: italic; }
    .chat-msg-thread-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #00a8fc;
      cursor: pointer;
      margin-top: 4px;
      font-weight: 500;
    }
    .chat-msg-thread-badge:hover { text-decoration: underline; }
    .chat-typing {
      padding: 4px 16px 8px;
      font-size: 12px;
      color: #80848e;
      height: 24px;
      flex-shrink: 0;
    }
    .chat-typing span { font-weight: 600; color: #b5bac1; }
    .chat-input-area {
      padding: 0 16px 16px;
      flex-shrink: 0;
    }
    .chat-reply-bar {
      background: #2b2d31;
      padding: 8px 12px;
      border-radius: 8px 8px 0 0;
      display: none;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #b5bac1;
    }
    .chat-reply-bar.active { display: flex; }
    .chat-reply-bar .reply-to-name { font-weight: 600; color: #f2f3f5; }
    .chat-reply-bar .reply-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #80848e;
      cursor: pointer;
      font-size: 16px;
    }
    .chat-input-box {
      background: #383a40;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      padding: 8px 12px;
      gap: 8px;
    }
    .chat-reply-bar.active + .chat-input-box { border-radius: 0 0 8px 8px; }
    .chat-input-box textarea {
      flex: 1;
      background: none;
      border: none;
      color: #dbdee1;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 120px;
      min-height: 20px;
      line-height: 1.4;
      padding: 2px 0;
    }
    .chat-input-box textarea::placeholder { color: #6d6f78; }
    .chat-attach-btn {
      background: none;
      border: none;
      color: #b5bac1;
      font-size: 20px;
      cursor: pointer;
      padding: 2px;
      flex-shrink: 0;
      line-height: 1;
    }
    .chat-attach-btn:hover { color: #f2f3f5; }
    .chat-send-btn {
      background: none;
      border: none;
      color: #5865f2;
      font-size: 20px;
      cursor: pointer;
      padding: 2px;
      flex-shrink: 0;
    }
    .chat-send-btn:hover { color: #7983f5; }
    .chat-mention-dropdown {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      background: #2b2d31;
      border: 1px solid #3f4147;
      border-radius: 8px;
      max-height: 200px;
      overflow-y: auto;
      display: none;
      z-index: 10;
      margin-bottom: 4px;
    }
    .chat-mention-dropdown.active { display: block; }
    .chat-mention-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      color: #dbdee1;
      font-size: 14px;
    }
    .chat-mention-item:hover, .chat-mention-item.selected { background: #36373d; }
    .chat-mention-item .avatar { width: 24px; height: 24px; font-size: 10px; line-height: 24px; }
    .chat-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: #80848e;
      text-align: center;
      padding: 24px;
    }
    .chat-empty h3 { color: #f2f3f5; font-size: 24px; margin: 0 0 8px; }
    .chat-empty p { font-size: 14px; margin: 0; }

    /* Thread panel */
    .thread-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      max-width: 100%;
      background: #2b2d31;
      border-left: 1px solid #3f4147;
      display: flex;
      flex-direction: column;
      z-index: 20;
      transform: translateX(100%);
      transition: transform 0.2s ease;
    }
    .thread-panel.open { transform: translateX(0); }
    .thread-header {
      padding: 12px 16px;
      border-bottom: 1px solid #3f4147;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .thread-header-title { font-size: 15px; font-weight: 600; color: #f2f3f5; }
    .thread-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #b5bac1;
      font-size: 20px;
      cursor: pointer;
    }
    .thread-close:hover { color: #f2f3f5; }
    .thread-parent {
      padding: 16px;
      border-bottom: 1px solid #3f4147;
      flex-shrink: 0;
    }
    .thread-replies {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .thread-replies::-webkit-scrollbar { width: 6px; }
    .thread-replies::-webkit-scrollbar-track { background: transparent; }
    .thread-replies::-webkit-scrollbar-thumb { background: #1a1b1e; border-radius: 3px; }
    .thread-input-area { padding: 0 12px 12px; flex-shrink: 0; }
    .thread-reply-bar { display: none; }
    .thread-reply-bar.active { display: flex; }

    .chat-date-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 8px;
      font-size: 11px;
      color: #80848e;
      font-weight: 600;
    }
    .chat-date-divider::before, .chat-date-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #3f4147;
    }

    /* Chat file attachments */
    .chat-msg-attachment {
      margin-top: 6px;
      max-width: 320px;
    }
    .chat-msg-attachment img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      cursor: pointer;
      display: block;
    }
    .chat-msg-attachment img:hover { opacity: 0.9; }
    .chat-msg-attachment-file {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #2b2d31;
      border: 1px solid #3f4147;
      border-radius: 8px;
      padding: 10px 14px;
      color: #00a8fc;
      text-decoration: none;
      font-size: 13px;
      transition: background 0.15s;
    }
    .chat-msg-attachment-file:hover { background: #36373d; }
    .chat-msg-attachment-file .file-icon { font-size: 20px; }
    .chat-msg-attachment-file .file-name { color: #00a8fc; font-weight: 500; }
    .chat-msg-attachment-file .file-size { color: #80848e; font-size: 11px; }
    .chat-file-preview-bar {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #2b2d31;
      border-radius: 8px 8px 0 0;
      font-size: 13px;
      color: #b5bac1;
    }
    .chat-file-preview-bar.active { display: flex; }
    .chat-file-preview-bar .file-preview-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chat-file-preview-bar .file-preview-close {
      background: none;
      border: none;
      color: #80848e;
      cursor: pointer;
      font-size: 16px;
    }
    .chat-file-preview-bar.active + .chat-reply-bar.active + .chat-input-box,
    .chat-file-preview-bar.active + .chat-input-box { border-radius: 0 0 8px 8px; }
  `;
}

function renderAvatar(username, pp, opts = {}) {
  const size = opts.size || 28;
  const fontSize = opts.fontSize || 12;
  const title = opts.title || username;
  const pic = pp && pp[username];
  if (pic) {
    return `<img src="${pic}" alt="${username}" title="${title}" class="avatar" style="width:${size}px;height:${size}px;object-fit:cover;">`;
  }
  return `<span class="avatar" title="${title}" style="width:${size}px;height:${size}px;font-size:${fontSize}px;line-height:${size}px;">${(username || '?').charAt(0).toUpperCase()}</span>`;
}


function systemsListPage(opts) {
  const { systems, users, currentUser, admin, filterAssigned, filterTag, profilePictures } = opts;
  const pp = profilePictures || {};
  
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
      renderAvatar(a, pp, { size: 24, fontSize: 11, title: `${a} has TODO tasks` })
    ).join('');
    
    return `
      <a href="/systems/${s.id}" class="system-card" style="border-left: 4px solid ${s.color || '#3b82f6'};">
        <div class="system-card-header">
          <h3 class="system-card-title">${s.name}</h3>
          ${s.created_by ? renderAvatar(s.created_by, pp, { title: `Created by ${s.created_by}` }) : ''}
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
        <a href="/profile">Profile</a>
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
  const { system, users, currentUser, admin, escapeHtml, profilePictures } = opts;
  const pp = profilePictures || {};
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
      renderAvatar(a, pp, { title: `Assigned to ${escapeHtml(a)}` })
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
        overflow: hidden;
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
        <a href="/profile">Profile</a>
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

      <!-- Chat Toggle Button -->
      <button class="chat-toggle-btn" id="chatToggleBtn" onclick="toggleChatPanel()" title="Open Chat">
        💬
        <span class="chat-toggle-badge" id="chatToggleBadge">0</span>
      </button>
      <!-- Chat Panel Overlay -->
      <div class="chat-panel-overlay" id="chatPanelOverlay" onclick="toggleChatPanel()"></div>
      <!-- Chat Sidebar Panel -->
      <div class="chat-panel" id="chatPanel">
        <div class="chat-wrapper" id="chatWrapper">
          <div class="chat-header">
            <span class="chat-header-icon">#</span>
            <span class="chat-header-title">${escapeHtml(system.name)}</span>
            <div class="chat-header-right" style="position:relative;">
              <span class="chat-notif-badge" id="chatNotifBadge" style="display:none;" title="Unread mentions" onclick="toggleNotifDropdown(event)">0</span>
              <div class="chat-notif-dropdown" id="chatNotifDropdown"></div>
              <button onclick="toggleChatPanel()" style="background:none;border:none;color:#b5bac1;font-size:20px;cursor:pointer;" title="Close">&times;</button>
            </div>
          </div>
          <div class="chat-messages" id="chatMessages">
            <div class="chat-empty" id="chatEmpty">
              <h3># ${escapeHtml(system.name)}</h3>
              <p>This is the start of the chat for this system.<br>Send a message to begin the conversation!</p>
            </div>
          </div>
          <div class="chat-typing" id="chatTyping"></div>
          <div class="chat-input-area" style="position:relative;">
            <div class="chat-mention-dropdown" id="mentionDropdown"></div>
            <div class="chat-file-preview-bar" id="chatFilePreview">
              <span>📎</span>
              <span class="file-preview-name" id="chatFilePreviewName"></span>
              <button class="file-preview-close" onclick="cancelChatFile()">&times;</button>
            </div>
            <div class="chat-reply-bar" id="chatReplyBar">
              <span>Replying to <span class="reply-to-name" id="replyToName"></span></span>
              <button class="reply-close" onclick="cancelReply()">&times;</button>
            </div>
            <div class="chat-input-box">
              <button class="chat-attach-btn" onclick="document.getElementById('chatFileInput').click()" title="Attach file">📎</button>
              <input type="file" id="chatFileInput" style="display:none;" onchange="chatFileSelected(this)">
              <textarea id="chatInput" rows="1" placeholder="Message #${escapeHtml(system.name)}" onkeydown="chatKeyDown(event)" oninput="chatInputHandler(this)"></textarea>
              <button class="chat-send-btn" onclick="sendChatMessage()" title="Send">&#9654;</button>
            </div>
          </div>
          <!-- Thread Panel -->
          <div class="thread-panel" id="threadPanel">
            <div class="thread-header">
              <span class="thread-header-title">Thread</span>
              <button class="thread-close" onclick="closeThread()">&times;</button>
            </div>
            <div class="thread-parent" id="threadParent"></div>
            <div class="thread-replies" id="threadReplies"></div>
            <div class="chat-typing" id="threadTyping"></div>
            <div class="thread-input-area" style="position:relative;">
              <div class="chat-mention-dropdown" id="threadMentionDropdown"></div>
              <div class="chat-reply-bar thread-reply-bar" id="threadReplyBar">
                <span>Replying to <span class="reply-to-name" id="threadReplyToName"></span></span>
                <button class="reply-close" onclick="cancelThreadReply()">&times;</button>
              </div>
              <div class="chat-input-box">
                <textarea id="threadInput" rows="1" placeholder="Reply in thread..." onkeydown="threadKeyDown(event)" oninput="threadInputHandler(this)"></textarea>
                <button class="chat-send-btn" onclick="sendThreadMessage()" title="Send">&#9654;</button>
              </div>
            </div>
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
      var _pp = ${JSON.stringify(pp)};
      function _av(name, title, size) {
        size = size || 28;
        if (_pp[name]) return '<img src="' + _pp[name] + '" alt="' + escapeHtml(name) + '" title="' + escapeHtml(title || name) + '" class="avatar" style="width:'+size+'px;height:'+size+'px;object-fit:cover;">';
        return '<span class="avatar" title="' + escapeHtml(title || name) + '" style="width:'+size+'px;height:'+size+'px;font-size:12px;line-height:'+size+'px;">' + (name||'?').charAt(0).toUpperCase() + '</span>';
      }
      
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
              assigneeAvatars += _av(name, 'Assigned to ' + name);
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

      // ============ CHAT SYSTEM ============
      var chatUsers = ${JSON.stringify((users || []).map(u => u.username))};
      var chatContextType = 'system';
      var chatContextId = systemId;
      var chatReplyTo = null;
      var chatTypingTimer = null;
      var chatIsTyping = false;
      var typingUsers = {};
      var threadParentId = null;
      var threadReplyTo = null;
      var threadTypingTimer = null;
      var chatMentionIdx = -1;
      var threadMentionIdx = -1;
      var chatLastSender = null;
      var chatLastTime = null;
      var chatPendingFile = null;
      var isAdminUser = ${admin ? 'true' : 'false'};

      // Chat panel toggle
      function toggleChatPanel() {
        var panel = document.getElementById('chatPanel');
        var overlay = document.getElementById('chatPanelOverlay');
        var isOpen = panel.classList.contains('open');
        if (isOpen) {
          panel.classList.remove('open');
          overlay.classList.remove('open');
        } else {
          panel.classList.add('open');
          overlay.classList.add('open');
          var container = document.getElementById('chatMessages');
          container.scrollTop = container.scrollHeight;
          markNotificationsRead();
        }
      }

      // Request notification permission on load
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Format chat timestamp
      function chatTime(iso) {
        var d = new Date(iso);
        var now = new Date();
        var h = d.getHours(), m = d.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        var time = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
        if (d.toDateString() === now.toDateString()) return 'Today at ' + time;
        var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday at ' + time;
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + time;
      }

      function chatDateLabel(iso) {
        var d = new Date(iso);
        var now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Today';
        var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      }

      // Render message body with @mentions highlighted
      function renderChatBody(body, deleted) {
        if (deleted) return '<em>[message deleted]</em>';
        var escaped = escapeHtml(body);
        escaped = escaped.replace(/@(\\w+)/g, function(match, name) {
          return '<span class="mention" onclick="mentionClick(\\''+name+'\\')">@' + name + '</span>';
        });
        return escaped;
      }

      // User color for chat (matches Discord style)
      var chatColors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];
      function chatColor(name) {
        var hash = 0;
        for (var i = 0; i < (name||'').length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
        return chatColors[hash % chatColors.length];
      }

      // Render attachment HTML for a message
      function renderChatAttachment(msg) {
        if (!msg.attachment_filename) return '';
        var isImage = (msg.attachment_mime_type || '').startsWith('image/');
        if (isImage) {
          return '<div class="chat-msg-attachment"><a href="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" target="_blank"><img src="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" alt="' + escapeHtml(msg.attachment_original_name) + '"></a></div>';
        }
        var sizeStr = '';
        if (msg.attachment_size) {
          var s = msg.attachment_size;
          if (s < 1024) sizeStr = s + ' B';
          else if (s < 1048576) sizeStr = (s / 1024).toFixed(1) + ' KB';
          else sizeStr = (s / 1048576).toFixed(1) + ' MB';
        }
        return '<div class="chat-msg-attachment"><a class="chat-msg-attachment-file" href="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" target="_blank" download><span class="file-icon">📄</span><div><div class="file-name">' + escapeHtml(msg.attachment_original_name) + '</div>' + (sizeStr ? '<div class="file-size">' + sizeStr + '</div>' : '') + '</div></a></div>';
      }

      // Render a single message DOM
      function renderChatMsg(msg, isFirstInGroup) {
        var div = document.createElement('div');
        div.className = 'chat-msg-group' + (isFirstInGroup ? ' first-in-group' : '') + (msg.deleted ? ' chat-msg-deleted' : '');
        div.setAttribute('data-msg-id', msg.id);
        div.setAttribute('data-sender', msg.sender);
        div.setAttribute('data-time', msg.created_at);

        var html = '';
        // Reply reference
        if (msg.reply_sender) {
          html += '<div class="chat-msg-reply-ref" onclick="scrollToMsg(' + (msg.reply_msg_id||'') + ')"><span class="reply-line"></span>' + _av(msg.reply_sender, msg.reply_sender, 16) + ' <span class="reply-sender">' + escapeHtml(msg.reply_sender) + '</span> <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;display:inline-block;">' + escapeHtml((msg.reply_body||'').substring(0,80)) + '</span></div>';
        }

        if (isFirstInGroup) {
          html += '<div style="display:flex;gap:12px;"><div class="chat-msg-avatar">' + _av(msg.sender, msg.sender, 36) + '</div><div class="chat-msg-body"><div class="chat-msg-header"><span class="chat-msg-sender" style="color:' + chatColor(msg.sender) + '">' + escapeHtml(msg.sender) + '</span><span class="chat-msg-time">' + chatTime(msg.created_at) + '</span></div>';
        } else {
          html += '<div style="display:flex;gap:12px;"><div style="width:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"><span class="chat-msg-time" style="font-size:10px;visibility:hidden;">' + chatTime(msg.created_at) + '</span></div><div class="chat-msg-body">';
        }

        html += '<div class="chat-msg-text">' + renderChatBody(msg.body, msg.deleted) + (msg.edited && !msg.deleted ? '<span class="chat-msg-edited">(edited)</span>' : '') + '</div>';
        if (!msg.deleted) html += renderChatAttachment(msg);

        if (msg.thread_count > 0) {
          html += '<div class="chat-msg-thread-badge" onclick="openThread(' + msg.id + ')">🧵 ' + msg.thread_count + ' repl' + (msg.thread_count === 1 ? 'y' : 'ies') + '</div>';
        }

        html += '</div></div>';

        // Hover actions
        if (!msg.deleted) {
          html += '<div class="chat-msg-actions">';
          html += '<button class="chat-msg-action-btn" title="Reply" onclick="startReply(' + msg.id + ',\\'' + escapeHtml(msg.sender) + '\\')">↩</button>';
          html += '<button class="chat-msg-action-btn" title="Thread" onclick="openThread(' + msg.id + ')">🧵</button>';
          if (msg.sender === currentUsername) {
            html += '<button class="chat-msg-action-btn" title="Edit" onclick="startEdit(' + msg.id + ')">✏</button>';
          }
          if (msg.sender === currentUsername || isAdminUser) {
            html += '<button class="chat-msg-action-btn" title="Delete" onclick="deleteMsg(' + msg.id + ')">🗑</button>';
          }
          html += '</div>';
        }

        div.innerHTML = html;

        // Show time on hover for continuation messages
        if (!isFirstInGroup) {
          div.addEventListener('mouseenter', function() {
            var ts = div.querySelector('.chat-msg-time');
            if (ts) ts.style.visibility = 'visible';
          });
          div.addEventListener('mouseleave', function() {
            var ts = div.querySelector('.chat-msg-time');
            if (ts) ts.style.visibility = 'hidden';
          });
        }

        return div;
      }

      // Determine if a message starts a new group (different sender or >5min gap)
      function isNewGroup(msg, prevMsg) {
        if (!prevMsg) return true;
        if (msg.sender !== prevMsg.sender) return true;
        var diff = new Date(msg.created_at) - new Date(prevMsg.created_at);
        return diff > 5 * 60 * 1000;
      }

      // Load chat messages
      async function loadChat() {
        try {
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId);
          var data = await resp.json();
          var container = document.getElementById('chatMessages');
          container.innerHTML = '';

          if (!data.messages || data.messages.length === 0) {
            container.innerHTML = '<div class="chat-empty" id="chatEmpty"><h3># ' + escapeHtml('${escapeHtml(system.name)}') + '</h3><p>This is the start of the chat for this system.<br>Send a message to begin the conversation!</p></div>';
            return;
          }

          var prevMsg = null;
          var prevDate = null;
          data.messages.forEach(function(msg) {
            var msgDate = new Date(msg.created_at).toDateString();
            if (msgDate !== prevDate) {
              var divider = document.createElement('div');
              divider.className = 'chat-date-divider';
              divider.textContent = chatDateLabel(msg.created_at);
              container.appendChild(divider);
              prevDate = msgDate;
              prevMsg = null;
            }
            var first = isNewGroup(msg, prevMsg);
            container.appendChild(renderChatMsg(msg, first));
            prevMsg = msg;
          });

          container.scrollTop = container.scrollHeight;
          loadNotifications();
        } catch (e) {
          console.error('Error loading chat:', e);
        }
      }

      // Send message
      // File attachment handling
      function chatFileSelected(input) {
        if (input.files && input.files[0]) {
          chatPendingFile = input.files[0];
          document.getElementById('chatFilePreviewName').textContent = chatPendingFile.name;
          document.getElementById('chatFilePreview').classList.add('active');
        }
      }
      function cancelChatFile() {
        chatPendingFile = null;
        document.getElementById('chatFileInput').value = '';
        document.getElementById('chatFilePreview').classList.remove('active');
      }

      async function sendChatMessage() {
        var input = document.getElementById('chatInput');
        var body = input.value.trim();
        if (!body && !chatPendingFile) return;
        try {
          var resp;
          if (chatPendingFile) {
            var formData = new FormData();
            formData.append('body', body || '');
            if (chatReplyTo) formData.append('reply_to_id', chatReplyTo);
            formData.append('files', chatPendingFile);
            resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
              method: 'POST',
              body: formData
            });
          } else {
            var payload = { body: body };
            if (chatReplyTo) payload.reply_to_id = chatReplyTo;
            resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
          var data = await resp.json();
          if (data.message) {
            appendChatMessage(data.message);
            socket.emit('chat-new-message', { room: room, message: data.message });
            input.value = '';
            input.style.height = 'auto';
            cancelReply();
            cancelChatFile();
            stopTyping();
          }
        } catch (e) {
          console.error('Error sending message:', e);
        }
      }

      function appendChatMessage(msg) {
        var container = document.getElementById('chatMessages');
        var empty = document.getElementById('chatEmpty');
        if (empty) empty.remove();
        var msgs = container.querySelectorAll('.chat-msg-group');
        var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
        var first = isNewGroup(msg, prevMsg);

        // Date divider if needed
        var lastDate = lastMsg ? new Date(lastMsg.getAttribute('data-time')).toDateString() : null;
        var msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== lastDate) {
          var divider = document.createElement('div');
          divider.className = 'chat-date-divider';
          divider.textContent = chatDateLabel(msg.created_at);
          container.appendChild(divider);
          first = true;
        }

        container.appendChild(renderChatMsg(msg, first));
        container.scrollTop = container.scrollHeight;
      }

      // Reply
      function startReply(msgId, sender) {
        chatReplyTo = msgId;
        document.getElementById('replyToName').textContent = sender;
        document.getElementById('chatReplyBar').classList.add('active');
        document.getElementById('chatInput').focus();
      }
      function cancelReply() {
        chatReplyTo = null;
        document.getElementById('chatReplyBar').classList.remove('active');
      }

      // Edit message
      function startEdit(msgId) {
        var msgEl = document.querySelector('[data-msg-id="' + msgId + '"]');
        if (!msgEl) return;
        var textEl = msgEl.querySelector('.chat-msg-text');
        if (!textEl) return;
        var oldText = textEl.textContent.replace(/\\(edited\\)$/, '').trim();
        var newText = prompt('Edit message:', oldText);
        if (newText === null || newText.trim() === '' || newText.trim() === oldText) return;
        fetch('/api/chat/message/' + msgId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newText.trim() })
        }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.success) {
            textEl.innerHTML = renderChatBody(newText.trim(), false) + '<span class="chat-msg-edited">(edited)</span>';
            socket.emit('chat-message-edited', { room: room, messageId: msgId, body: newText.trim() });
          }
        });
      }

      // Delete message
      function deleteMsg(msgId) {
        if (!confirm('Delete this message?')) return;
        fetch('/api/chat/message/' + msgId, { method: 'DELETE' }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.success) {
            var el = document.querySelector('[data-msg-id="' + msgId + '"]');
            if (el) {
              el.classList.add('chat-msg-deleted');
              var textEl = el.querySelector('.chat-msg-text');
              if (textEl) textEl.innerHTML = '<em>[message deleted]</em>';
              var actions = el.querySelector('.chat-msg-actions');
              if (actions) actions.remove();
            }
            socket.emit('chat-message-deleted', { room: room, messageId: msgId });
          }
        });
      }

      function scrollToMsg(msgId) {
        var el = document.querySelector('[data-msg-id="' + msgId + '"]');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('chat-msg-highlight');
          setTimeout(function() { el.classList.remove('chat-msg-highlight'); }, 1500);
        }
      }

      function mentionClick(name) {
        // Could open profile or start mention — no-op for now
      }

      // Typing indicator
      function startTyping() {
        if (!chatIsTyping) {
          chatIsTyping = true;
          socket.emit('chat-typing', { room: room, username: currentUsername });
        }
        clearTimeout(chatTypingTimer);
        chatTypingTimer = setTimeout(stopTyping, 3000);
      }
      function stopTyping() {
        if (chatIsTyping) {
          chatIsTyping = false;
          socket.emit('chat-stop-typing', { room: room, username: currentUsername });
        }
        clearTimeout(chatTypingTimer);
      }

      function updateTypingIndicator() {
        var el = document.getElementById('chatTyping');
        var names = Object.keys(typingUsers).filter(function(n) { return n !== currentUsername; });
        if (names.length === 0) {
          el.innerHTML = '';
        } else if (names.length === 1) {
          el.innerHTML = '<span>' + escapeHtml(names[0]) + '</span> is typing...';
        } else if (names.length === 2) {
          el.innerHTML = '<span>' + escapeHtml(names[0]) + '</span> and <span>' + escapeHtml(names[1]) + '</span> are typing...';
        } else {
          el.innerHTML = 'Several people are typing...';
        }
      }

      // Chat input handling
      function chatKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      }

      function chatInputHandler(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        startTyping();
        handleMentionAutocomplete(textarea, 'mentionDropdown', false);
      }

      // Mention autocomplete
      function handleMentionAutocomplete(textarea, dropdownId, isThread) {
        var val = textarea.value;
        var pos = textarea.selectionStart;
        var before = val.substring(0, pos);
        var atMatch = before.match(/@(\\w*)$/);
        var dropdown = document.getElementById(dropdownId);

        if (atMatch) {
          var query = atMatch[1].toLowerCase();
          var matches = chatUsers.filter(function(u) { return u.toLowerCase().indexOf(query) !== -1 && u !== currentUsername; });
          if (matches.length > 0) {
            dropdown.innerHTML = matches.map(function(u, i) {
              return '<div class="chat-mention-item' + (i === 0 ? ' selected' : '') + '" data-username="' + escapeHtml(u) + '" onclick="insertMention(\\'' + escapeHtml(u) + '\\', \\'' + (isThread ? 'threadInput' : 'chatInput') + '\\', \\'' + dropdownId + '\\')">' + _av(u, u, 24) + ' ' + escapeHtml(u) + '</div>';
            }).join('');
            dropdown.classList.add('active');
            if (isThread) threadMentionIdx = 0; else chatMentionIdx = 0;
            return;
          }
        }
        dropdown.classList.remove('active');
        if (isThread) threadMentionIdx = -1; else chatMentionIdx = -1;
      }

      function insertMention(username, inputId, dropdownId) {
        var textarea = document.getElementById(inputId);
        var val = textarea.value;
        var pos = textarea.selectionStart;
        var before = val.substring(0, pos);
        var after = val.substring(pos);
        var newBefore = before.replace(/@\\w*$/, '@' + username + ' ');
        textarea.value = newBefore + after;
        textarea.selectionStart = textarea.selectionEnd = newBefore.length;
        textarea.focus();
        document.getElementById(dropdownId).classList.remove('active');
      }

      // Notifications
      var _cachedNotifs = [];
      async function loadNotifications() {
        try {
          var resp = await fetch('/api/chat/notifications');
          var data = await resp.json();
          var allNotifs = data.notifications || [];
          _cachedNotifs = allNotifs;
          var badge = document.getElementById('chatNotifBadge');
          var toggleBadge = document.getElementById('chatToggleBadge');
          var contextNotifs = allNotifs.filter(function(n) {
            return n.context_type === chatContextType && n.context_id == chatContextId;
          });
          var total = allNotifs.length;
          if (total > 0) {
            badge.textContent = total;
            badge.style.display = 'inline-block';
            toggleBadge.textContent = total;
            toggleBadge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
            toggleBadge.style.display = 'none';
          }
          renderNotifDropdown(allNotifs);
        } catch(e) {}
      }

      function renderNotifDropdown(notifs) {
        var dd = document.getElementById('chatNotifDropdown');
        if (!notifs.length) { dd.innerHTML = '<div class="chat-notif-empty">No unread mentions</div>'; return; }
        dd.innerHTML = notifs.map(function(n) {
          var isCurrent = n.context_type === chatContextType && n.context_id == chatContextId;
          var url = '';
          if (!isCurrent) {
            if (n.context_type === 'system') url = '/systems/' + n.context_id + '?chatMsg=' + n.message_id;
            else url = '/systems/' + (n.system_id || 0) + '/tasks/' + n.context_id + '?chatMsg=' + n.message_id;
          }
          return '<div class="chat-notif-item">' +
            '<div class="chat-notif-item-body">' +
              '<div class="chat-notif-item-sender">' + escapeHtml(n.sender) + '</div>' +
              '<div class="chat-notif-item-text">' + escapeHtml((n.body || '').substring(0, 80)) + '</div>' +
              '<div class="chat-notif-item-context">' + (n.context_type === 'system' ? 'System' : 'Task') + ' chat</div>' +
            '</div>' +
            (isCurrent
              ? '<button class="chat-notif-goto" onclick="gotoNotifMsg(' + n.message_id + ')">GoTo</button>'
              : '<a href="' + url + '" class="chat-notif-goto" style="text-decoration:none;">GoTo</a>') +
          '</div>';
        }).join('');
      }

      function toggleNotifDropdown(e) {
        e.stopPropagation();
        var dd = document.getElementById('chatNotifDropdown');
        dd.classList.toggle('open');
      }
      document.addEventListener('click', function(e) {
        var dd = document.getElementById('chatNotifDropdown');
        if (dd && !dd.contains(e.target) && e.target.id !== 'chatNotifBadge') dd.classList.remove('open');
      });

      function gotoNotifMsg(msgId) {
        document.getElementById('chatNotifDropdown').classList.remove('open');
        scrollToMsg(msgId);
        markNotificationsRead();
      }

      async function markNotificationsRead() {
        try {
          await fetch('/api/chat/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context_type: chatContextType, context_id: chatContextId })
          });
          document.getElementById('chatNotifBadge').style.display = 'none';
          document.getElementById('chatToggleBadge').style.display = 'none';
        } catch(e) {}
      }

      function showBrowserNotification(msg) {
        if ('Notification' in window && Notification.permission === 'granted' && msg.sender !== currentUsername) {
          var n = new Notification(msg.sender + ' mentioned you', {
            body: msg.body.substring(0, 100),
            icon: _pp[msg.sender] || undefined
          });
          n.onclick = function() { window.focus(); gotoNotifMsg(msg.id); n.close(); };
          setTimeout(function() { n.close(); }, 5000);
        }
      }

      // ============ THREAD PANEL ============
      function openThread(parentId) {
        threadParentId = parentId;
        var panel = document.getElementById('threadPanel');
        panel.classList.add('open');
        loadThread(parentId);
      }

      function closeThread() {
        threadParentId = null;
        document.getElementById('threadPanel').classList.remove('open');
      }

      async function loadThread(parentId) {
        try {
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId + '/thread/' + parentId);
          var data = await resp.json();
          var parentContainer = document.getElementById('threadParent');
          var repliesContainer = document.getElementById('threadReplies');

          if (data.parent) {
            parentContainer.innerHTML = '';
            parentContainer.appendChild(renderChatMsg(data.parent, true));
          }

          repliesContainer.innerHTML = '';
          var prevMsg = null;
          (data.replies || []).forEach(function(msg) {
            var first = isNewGroup(msg, prevMsg);
            repliesContainer.appendChild(renderChatMsg(msg, first));
            prevMsg = msg;
          });
          repliesContainer.scrollTop = repliesContainer.scrollHeight;
        } catch(e) {
          console.error('Error loading thread:', e);
        }
      }

      async function sendThreadMessage() {
        if (!threadParentId) return;
        var input = document.getElementById('threadInput');
        var body = input.value.trim();
        if (!body) return;
        try {
          var payload = { body: body, parent_id: threadParentId };
          if (threadReplyTo) payload.reply_to_id = threadReplyTo;
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          var data = await resp.json();
          if (data.message) {
            var repliesContainer = document.getElementById('threadReplies');
            var msgs = repliesContainer.querySelectorAll('.chat-msg-group');
            var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
            repliesContainer.appendChild(renderChatMsg(data.message, isNewGroup(data.message, prevMsg)));
            repliesContainer.scrollTop = repliesContainer.scrollHeight;
            socket.emit('chat-new-message', { room: room, message: data.message });
            input.value = '';
            input.style.height = 'auto';
            cancelThreadReply();
            // Update thread count badge in main chat
            var badge = document.querySelector('[data-msg-id="' + threadParentId + '"] .chat-msg-thread-badge');
            if (badge) {
              var count = parseInt(badge.textContent.match(/\\d+/)) + 1;
              badge.innerHTML = '🧵 ' + count + ' repl' + (count === 1 ? 'y' : 'ies');
            } else {
              var parentEl = document.querySelector('[data-msg-id="' + threadParentId + '"] .chat-msg-body');
              if (parentEl) {
                var b = document.createElement('div');
                b.className = 'chat-msg-thread-badge';
                b.setAttribute('onclick', 'openThread(' + threadParentId + ')');
                b.innerHTML = '🧵 1 reply';
                parentEl.appendChild(b);
              }
            }
          }
        } catch(e) {
          console.error('Error sending thread message:', e);
        }
      }

      function cancelThreadReply() {
        threadReplyTo = null;
        document.getElementById('threadReplyBar').classList.remove('active');
      }

      function threadKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendThreadMessage();
        }
      }

      function threadInputHandler(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        handleMentionAutocomplete(textarea, 'threadMentionDropdown', true);
      }

      // ============ SOCKET CHAT EVENTS ============
      socket.on('chat-message-received', function(data) {
        if (!data.message) return;
        var msg = data.message;
        // If it's our own message, skip (we already appended it)
        if (msg.sender === currentUsername) return;

        if (msg.parent_id) {
          // Thread reply
          if (threadParentId === msg.parent_id) {
            var repliesContainer = document.getElementById('threadReplies');
            var msgs = repliesContainer.querySelectorAll('.chat-msg-group');
            var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
            repliesContainer.appendChild(renderChatMsg(msg, isNewGroup(msg, prevMsg)));
            repliesContainer.scrollTop = repliesContainer.scrollHeight;
          }
          // Update thread count in main chat
          var badge = document.querySelector('[data-msg-id="' + msg.parent_id + '"] .chat-msg-thread-badge');
          if (badge) {
            var count = parseInt(badge.textContent.match(/\\d+/)) + 1;
            badge.innerHTML = '🧵 ' + count + ' repl' + (count === 1 ? 'y' : 'ies');
          } else {
            var parentEl = document.querySelector('[data-msg-id="' + msg.parent_id + '"] .chat-msg-body');
            if (parentEl) {
              var b = document.createElement('div');
              b.className = 'chat-msg-thread-badge';
              b.setAttribute('onclick', 'openThread(' + msg.parent_id + ')');
              b.innerHTML = '🧵 1 reply';
              parentEl.appendChild(b);
            }
          }
        } else {
          appendChatMessage(msg);
        }

        // Check if mentioned
        if (msg.body && msg.body.indexOf('@' + currentUsername) !== -1) {
          showBrowserNotification(msg);
          loadNotifications();
        }
      });

      socket.on('chat-message-updated', function(data) {
        var el = document.querySelector('[data-msg-id="' + data.messageId + '"]');
        if (el) {
          var textEl = el.querySelector('.chat-msg-text');
          if (textEl) textEl.innerHTML = renderChatBody(data.body, false) + '<span class="chat-msg-edited">(edited)</span>';
        }
        // Also in thread panel
        if (threadParentId) {
          var tel = document.querySelector('#threadReplies [data-msg-id="' + data.messageId + '"], #threadParent [data-msg-id="' + data.messageId + '"]');
          if (tel) {
            var tt = tel.querySelector('.chat-msg-text');
            if (tt) tt.innerHTML = renderChatBody(data.body, false) + '<span class="chat-msg-edited">(edited)</span>';
          }
        }
      });

      socket.on('chat-message-removed', function(data) {
        var el = document.querySelector('[data-msg-id="' + data.messageId + '"]');
        if (el) {
          el.classList.add('chat-msg-deleted');
          var textEl = el.querySelector('.chat-msg-text');
          if (textEl) textEl.innerHTML = '<em>[message deleted]</em>';
          var actions = el.querySelector('.chat-msg-actions');
          if (actions) actions.remove();
        }
      });

      socket.on('chat-user-typing', function(data) {
        if (data.username === currentUsername) return;
        typingUsers[data.username] = true;
        updateTypingIndicator();
      });

      socket.on('chat-user-stop-typing', function(data) {
        delete typingUsers[data.username];
        updateTypingIndicator();
      });

      // Mark notifications read when chat is visible and scrolled
      var chatMessagesEl = document.getElementById('chatMessages');
      var chatObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) markNotificationsRead();
      }, { threshold: 0.5 });
      chatObserver.observe(chatMessagesEl);

      // Load chat on page load
      loadChat();

      // Auto-open chat and scroll to message if ?chatMsg= is in URL
      (function() {
        var params = new URLSearchParams(window.location.search);
        var chatMsgId = params.get('chatMsg');
        if (chatMsgId) {
          // Open chat panel
          var panel = document.getElementById('chatPanel');
          var overlay = document.getElementById('chatPanelOverlay');
          panel.classList.add('open');
          overlay.classList.add('open');
          // Wait for messages to load, then scroll
          setTimeout(function() { scrollToMsg(parseInt(chatMsgId)); }, 600);
        }
      })();
    </script>
  </body>
  </html>
  `;
}


function taskDetailPage(opts) {
  const { system, task, checklist, attachments, users, currentUser, admin, escapeHtml, profilePictures } = opts;
  const pp = profilePictures || {};
  
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
    renderAvatar(a, pp, { title: escapeHtml(a) })
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
        <a href="/profile">Profile</a>
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

      <!-- Chat Toggle Button -->
      <button class="chat-toggle-btn" id="chatToggleBtn" onclick="toggleChatPanel()" title="Open Chat">
        💬
        <span class="chat-toggle-badge" id="chatToggleBadge">0</span>
      </button>
      <!-- Chat Panel Overlay -->
      <div class="chat-panel-overlay" id="chatPanelOverlay" onclick="toggleChatPanel()"></div>
      <!-- Chat Sidebar Panel -->
      <div class="chat-panel" id="chatPanel">
        <div class="chat-wrapper" id="chatWrapper">
          <div class="chat-header">
            <span class="chat-header-icon">#</span>
            <span class="chat-header-title">${escapeHtml(task.title)}</span>
            <div class="chat-header-right" style="position:relative;">
              <span class="chat-notif-badge" id="chatNotifBadge" style="display:none;" title="Unread mentions" onclick="toggleNotifDropdown(event)">0</span>
              <div class="chat-notif-dropdown" id="chatNotifDropdown"></div>
              <button onclick="toggleChatPanel()" style="background:none;border:none;color:#b5bac1;font-size:20px;cursor:pointer;" title="Close">&times;</button>
            </div>
          </div>
          <div class="chat-messages" id="chatMessages">
            <div class="chat-empty" id="chatEmpty">
              <h3># ${escapeHtml(task.title)}</h3>
              <p>This is the start of the chat for this task.<br>Send a message to begin the conversation!</p>
            </div>
          </div>
          <div class="chat-typing" id="chatTyping"></div>
          <div class="chat-input-area" style="position:relative;">
            <div class="chat-mention-dropdown" id="mentionDropdown"></div>
            <div class="chat-file-preview-bar" id="chatFilePreview">
              <span>📎</span>
              <span class="file-preview-name" id="chatFilePreviewName"></span>
              <button class="file-preview-close" onclick="cancelChatFile()">&times;</button>
            </div>
            <div class="chat-reply-bar" id="chatReplyBar">
              <span>Replying to <span class="reply-to-name" id="replyToName"></span></span>
              <button class="reply-close" onclick="cancelReply()">&times;</button>
            </div>
            <div class="chat-input-box">
              <button class="chat-attach-btn" onclick="document.getElementById('chatFileInput').click()" title="Attach file">📎</button>
              <input type="file" id="chatFileInput" style="display:none;" onchange="chatFileSelected(this)">
              <textarea id="chatInput" rows="1" placeholder="Message #${escapeHtml(task.title)}" onkeydown="chatKeyDown(event)" oninput="chatInputHandler(this)"></textarea>
              <button class="chat-send-btn" onclick="sendChatMessage()" title="Send">&#9654;</button>
            </div>
          </div>
          <!-- Thread Panel -->
          <div class="thread-panel" id="threadPanel">
            <div class="thread-header">
              <span class="thread-header-title">Thread</span>
              <button class="thread-close" onclick="closeThread()">&times;</button>
            </div>
            <div class="thread-parent" id="threadParent"></div>
            <div class="thread-replies" id="threadReplies"></div>
            <div class="chat-typing" id="threadTyping"></div>
            <div class="thread-input-area" style="position:relative;">
              <div class="chat-mention-dropdown" id="threadMentionDropdown"></div>
              <div class="chat-reply-bar thread-reply-bar" id="threadReplyBar">
                <span>Replying to <span class="reply-to-name" id="threadReplyToName"></span></span>
                <button class="reply-close" onclick="cancelThreadReply()">&times;</button>
              </div>
              <div class="chat-input-box">
                <textarea id="threadInput" rows="1" placeholder="Reply in thread..." onkeydown="threadKeyDown(event)" oninput="threadInputHandler(this)"></textarea>
                <button class="chat-send-btn" onclick="sendThreadMessage()" title="Send">&#9654;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      var systemId = ${system.id};
      var taskId = ${task.id};
      var _pp = ${JSON.stringify(pp)};
      function _av(name, title, size) {
        size = size || 28;
        if (_pp[name]) return '<img src="' + _pp[name] + '" alt="' + escapeHtml(name) + '" title="' + escapeHtml(title || name) + '" class="avatar" style="width:'+size+'px;height:'+size+'px;object-fit:cover;">';
        return '<span class="avatar" title="' + escapeHtml(title || name) + '" style="width:'+size+'px;height:'+size+'px;font-size:12px;line-height:'+size+'px;">' + (name||'?').charAt(0).toUpperCase() + '</span>';
      }
      
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

      // ============ CHAT SYSTEM ============
      var chatUsers = ${JSON.stringify((users || []).map(u => u.username))};
      var chatContextType = 'task';
      var chatContextId = taskId;
      var chatReplyTo = null;
      var chatTypingTimer = null;
      var chatIsTyping = false;
      var typingUsers = {};
      var threadParentId = null;
      var threadReplyTo = null;
      var threadTypingTimer = null;
      var chatMentionIdx = -1;
      var threadMentionIdx = -1;
      var chatPendingFile = null;
      var isAdminUser = ${admin ? 'true' : 'false'};

      // Chat panel toggle
      function toggleChatPanel() {
        var panel = document.getElementById('chatPanel');
        var overlay = document.getElementById('chatPanelOverlay');
        var isOpen = panel.classList.contains('open');
        if (isOpen) {
          panel.classList.remove('open');
          overlay.classList.remove('open');
        } else {
          panel.classList.add('open');
          overlay.classList.add('open');
          var container = document.getElementById('chatMessages');
          container.scrollTop = container.scrollHeight;
          markNotificationsRead();
        }
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      function chatTime(iso) {
        var d = new Date(iso);
        var now = new Date();
        var h = d.getHours(), m = d.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        var time = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
        if (d.toDateString() === now.toDateString()) return 'Today at ' + time;
        var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday at ' + time;
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + time;
      }

      function chatDateLabel(iso) {
        var d = new Date(iso);
        var now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Today';
        var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      }

      function renderChatBody(body, deleted) {
        if (deleted) return '<em>[message deleted]</em>';
        var escaped = escapeHtml(body);
        escaped = escaped.replace(/@(\\w+)/g, function(match, name) {
          return '<span class="mention" onclick="mentionClick(\\''+name+'\\')">@' + name + '</span>';
        });
        return escaped;
      }

      var chatColors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];
      function chatColor(name) {
        var hash = 0;
        for (var i = 0; i < (name||'').length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
        return chatColors[hash % chatColors.length];
      }

      // Render attachment HTML for a message
      function renderChatAttachment(msg) {
        if (!msg.attachment_filename) return '';
        var isImage = (msg.attachment_mime_type || '').startsWith('image/');
        if (isImage) {
          return '<div class="chat-msg-attachment"><a href="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" target="_blank"><img src="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" alt="' + escapeHtml(msg.attachment_original_name) + '"></a></div>';
        }
        var sizeStr = '';
        if (msg.attachment_size) {
          var s = msg.attachment_size;
          if (s < 1024) sizeStr = s + ' B';
          else if (s < 1048576) sizeStr = (s / 1024).toFixed(1) + ' KB';
          else sizeStr = (s / 1048576).toFixed(1) + ' MB';
        }
        return '<div class="chat-msg-attachment"><a class="chat-msg-attachment-file" href="/uploads/' + encodeURIComponent(msg.attachment_filename) + '" target="_blank" download><span class="file-icon">📄</span><div><div class="file-name">' + escapeHtml(msg.attachment_original_name) + '</div>' + (sizeStr ? '<div class="file-size">' + sizeStr + '</div>' : '') + '</div></a></div>';
      }

      function renderChatMsg(msg, isFirstInGroup) {
        var div = document.createElement('div');
        div.className = 'chat-msg-group' + (isFirstInGroup ? ' first-in-group' : '') + (msg.deleted ? ' chat-msg-deleted' : '');
        div.setAttribute('data-msg-id', msg.id);
        div.setAttribute('data-sender', msg.sender);
        div.setAttribute('data-time', msg.created_at);

        var html = '';
        if (msg.reply_sender) {
          html += '<div class="chat-msg-reply-ref" onclick="scrollToMsg(' + (msg.reply_msg_id||'') + ')"><span class="reply-line"></span>' + _av(msg.reply_sender, msg.reply_sender, 16) + ' <span class="reply-sender">' + escapeHtml(msg.reply_sender) + '</span> <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;display:inline-block;">' + escapeHtml((msg.reply_body||'').substring(0,80)) + '</span></div>';
        }

        if (isFirstInGroup) {
          html += '<div style="display:flex;gap:12px;"><div class="chat-msg-avatar">' + _av(msg.sender, msg.sender, 36) + '</div><div class="chat-msg-body"><div class="chat-msg-header"><span class="chat-msg-sender" style="color:' + chatColor(msg.sender) + '">' + escapeHtml(msg.sender) + '</span><span class="chat-msg-time">' + chatTime(msg.created_at) + '</span></div>';
        } else {
          html += '<div style="display:flex;gap:12px;"><div style="width:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"><span class="chat-msg-time" style="font-size:10px;visibility:hidden;">' + chatTime(msg.created_at) + '</span></div><div class="chat-msg-body">';
        }

        html += '<div class="chat-msg-text">' + renderChatBody(msg.body, msg.deleted) + (msg.edited && !msg.deleted ? '<span class="chat-msg-edited">(edited)</span>' : '') + '</div>';
        if (!msg.deleted) html += renderChatAttachment(msg);

        if (msg.thread_count > 0) {
          html += '<div class="chat-msg-thread-badge" onclick="openThread(' + msg.id + ')">🧵 ' + msg.thread_count + ' repl' + (msg.thread_count === 1 ? 'y' : 'ies') + '</div>';
        }

        html += '</div></div>';

        if (!msg.deleted) {
          html += '<div class="chat-msg-actions">';
          html += '<button class="chat-msg-action-btn" title="Reply" onclick="startReply(' + msg.id + ',\\'' + escapeHtml(msg.sender) + '\\')">↩</button>';
          html += '<button class="chat-msg-action-btn" title="Thread" onclick="openThread(' + msg.id + ')">🧵</button>';
          if (msg.sender === currentUsername) {
            html += '<button class="chat-msg-action-btn" title="Edit" onclick="startEdit(' + msg.id + ')">✏</button>';
          }
          if (msg.sender === currentUsername || isAdminUser) {
            html += '<button class="chat-msg-action-btn" title="Delete" onclick="deleteMsg(' + msg.id + ')">🗑</button>';
          }
          html += '</div>';
        }

        div.innerHTML = html;
        if (!isFirstInGroup) {
          div.addEventListener('mouseenter', function() { var ts = div.querySelector('.chat-msg-time'); if (ts) ts.style.visibility = 'visible'; });
          div.addEventListener('mouseleave', function() { var ts = div.querySelector('.chat-msg-time'); if (ts) ts.style.visibility = 'hidden'; });
        }
        return div;
      }

      function isNewGroup(msg, prevMsg) {
        if (!prevMsg) return true;
        if (msg.sender !== prevMsg.sender) return true;
        return (new Date(msg.created_at) - new Date(prevMsg.created_at)) > 5 * 60 * 1000;
      }

      async function loadChat() {
        try {
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId);
          var data = await resp.json();
          var container = document.getElementById('chatMessages');
          container.innerHTML = '';
          if (!data.messages || data.messages.length === 0) {
            container.innerHTML = '<div class="chat-empty" id="chatEmpty"><h3># ' + escapeHtml('${escapeHtml(task.title)}') + '</h3><p>This is the start of the chat for this task.<br>Send a message to begin the conversation!</p></div>';
            return;
          }
          var prevMsg = null, prevDate = null;
          data.messages.forEach(function(msg) {
            var msgDate = new Date(msg.created_at).toDateString();
            if (msgDate !== prevDate) {
              var divider = document.createElement('div');
              divider.className = 'chat-date-divider';
              divider.textContent = chatDateLabel(msg.created_at);
              container.appendChild(divider);
              prevDate = msgDate;
              prevMsg = null;
            }
            container.appendChild(renderChatMsg(msg, isNewGroup(msg, prevMsg)));
            prevMsg = msg;
          });
          container.scrollTop = container.scrollHeight;
          loadNotifications();
        } catch(e) { console.error('Error loading chat:', e); }
      }

      // File attachment handling
      function chatFileSelected(input) {
        if (input.files && input.files[0]) {
          chatPendingFile = input.files[0];
          document.getElementById('chatFilePreviewName').textContent = chatPendingFile.name;
          document.getElementById('chatFilePreview').classList.add('active');
        }
      }
      function cancelChatFile() {
        chatPendingFile = null;
        document.getElementById('chatFileInput').value = '';
        document.getElementById('chatFilePreview').classList.remove('active');
      }

      async function sendChatMessage() {
        var input = document.getElementById('chatInput');
        var body = input.value.trim();
        if (!body && !chatPendingFile) return;
        try {
          var resp;
          if (chatPendingFile) {
            var formData = new FormData();
            formData.append('body', body || '');
            if (chatReplyTo) formData.append('reply_to_id', chatReplyTo);
            formData.append('files', chatPendingFile);
            resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
              method: 'POST',
              body: formData
            });
          } else {
            var payload = { body: body };
            if (chatReplyTo) payload.reply_to_id = chatReplyTo;
            resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
          var data = await resp.json();
          if (data.message) {
            appendChatMessage(data.message);
            socket.emit('chat-new-message', { room: room, message: data.message });
            input.value = '';
            input.style.height = 'auto';
            cancelReply();
            cancelChatFile();
            stopTyping();
          }
        } catch(e) { console.error('Error sending message:', e); }
      }

      function appendChatMessage(msg) {
        var container = document.getElementById('chatMessages');
        var empty = document.getElementById('chatEmpty');
        if (empty) empty.remove();
        var msgs = container.querySelectorAll('.chat-msg-group');
        var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
        var first = isNewGroup(msg, prevMsg);
        var lastDate = lastMsg ? new Date(lastMsg.getAttribute('data-time')).toDateString() : null;
        var msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== lastDate) {
          var divider = document.createElement('div');
          divider.className = 'chat-date-divider';
          divider.textContent = chatDateLabel(msg.created_at);
          container.appendChild(divider);
          first = true;
        }
        container.appendChild(renderChatMsg(msg, first));
        container.scrollTop = container.scrollHeight;
      }

      function startReply(msgId, sender) {
        chatReplyTo = msgId;
        document.getElementById('replyToName').textContent = sender;
        document.getElementById('chatReplyBar').classList.add('active');
        document.getElementById('chatInput').focus();
      }
      function cancelReply() {
        chatReplyTo = null;
        document.getElementById('chatReplyBar').classList.remove('active');
      }

      function startEdit(msgId) {
        var msgEl = document.querySelector('[data-msg-id="' + msgId + '"]');
        if (!msgEl) return;
        var textEl = msgEl.querySelector('.chat-msg-text');
        if (!textEl) return;
        var oldText = textEl.textContent.replace(/\\(edited\\)$/, '').trim();
        var newText = prompt('Edit message:', oldText);
        if (newText === null || newText.trim() === '' || newText.trim() === oldText) return;
        fetch('/api/chat/message/' + msgId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newText.trim() })
        }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.success) {
            textEl.innerHTML = renderChatBody(newText.trim(), false) + '<span class="chat-msg-edited">(edited)</span>';
            socket.emit('chat-message-edited', { room: room, messageId: msgId, body: newText.trim() });
          }
        });
      }

      function deleteMsg(msgId) {
        if (!confirm('Delete this message?')) return;
        fetch('/api/chat/message/' + msgId, { method: 'DELETE' }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.success) {
            var el = document.querySelector('[data-msg-id="' + msgId + '"]');
            if (el) {
              el.classList.add('chat-msg-deleted');
              var textEl = el.querySelector('.chat-msg-text');
              if (textEl) textEl.innerHTML = '<em>[message deleted]</em>';
              var actions = el.querySelector('.chat-msg-actions');
              if (actions) actions.remove();
            }
            socket.emit('chat-message-deleted', { room: room, messageId: msgId });
          }
        });
      }

      function scrollToMsg(msgId) {
        var el = document.querySelector('[data-msg-id="' + msgId + '"]');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('chat-msg-highlight');
          setTimeout(function() { el.classList.remove('chat-msg-highlight'); }, 1500);
        }
      }

      function mentionClick(name) {}

      function startTyping() {
        if (!chatIsTyping) {
          chatIsTyping = true;
          socket.emit('chat-typing', { room: room, username: currentUsername });
        }
        clearTimeout(chatTypingTimer);
        chatTypingTimer = setTimeout(stopTyping, 3000);
      }
      function stopTyping() {
        if (chatIsTyping) {
          chatIsTyping = false;
          socket.emit('chat-stop-typing', { room: room, username: currentUsername });
        }
        clearTimeout(chatTypingTimer);
      }

      function updateTypingIndicator() {
        var el = document.getElementById('chatTyping');
        var names = Object.keys(typingUsers).filter(function(n) { return n !== currentUsername; });
        if (names.length === 0) el.innerHTML = '';
        else if (names.length === 1) el.innerHTML = '<span>' + escapeHtml(names[0]) + '</span> is typing...';
        else if (names.length === 2) el.innerHTML = '<span>' + escapeHtml(names[0]) + '</span> and <span>' + escapeHtml(names[1]) + '</span> are typing...';
        else el.innerHTML = 'Several people are typing...';
      }

      function chatKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
      }

      function chatInputHandler(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        startTyping();
        handleMentionAutocomplete(textarea, 'mentionDropdown', false);
      }

      function handleMentionAutocomplete(textarea, dropdownId, isThread) {
        var val = textarea.value;
        var pos = textarea.selectionStart;
        var before = val.substring(0, pos);
        var atMatch = before.match(/@(\\w*)$/);
        var dropdown = document.getElementById(dropdownId);
        if (atMatch) {
          var query = atMatch[1].toLowerCase();
          var matches = chatUsers.filter(function(u) { return u.toLowerCase().indexOf(query) !== -1 && u !== currentUsername; });
          if (matches.length > 0) {
            dropdown.innerHTML = matches.map(function(u, i) {
              return '<div class="chat-mention-item' + (i === 0 ? ' selected' : '') + '" data-username="' + escapeHtml(u) + '" onclick="insertMention(\\'' + escapeHtml(u) + '\\', \\'' + (isThread ? 'threadInput' : 'chatInput') + '\\', \\'' + dropdownId + '\\')">' + _av(u, u, 24) + ' ' + escapeHtml(u) + '</div>';
            }).join('');
            dropdown.classList.add('active');
            return;
          }
        }
        dropdown.classList.remove('active');
      }

      function insertMention(username, inputId, dropdownId) {
        var textarea = document.getElementById(inputId);
        var val = textarea.value;
        var pos = textarea.selectionStart;
        var before = val.substring(0, pos);
        var after = val.substring(pos);
        var newBefore = before.replace(/@\\w*$/, '@' + username + ' ');
        textarea.value = newBefore + after;
        textarea.selectionStart = textarea.selectionEnd = newBefore.length;
        textarea.focus();
        document.getElementById(dropdownId).classList.remove('active');
      }

      var _cachedNotifs = [];
      async function loadNotifications() {
        try {
          var resp = await fetch('/api/chat/notifications');
          var data = await resp.json();
          var allNotifs = data.notifications || [];
          _cachedNotifs = allNotifs;
          var badge = document.getElementById('chatNotifBadge');
          var toggleBadge = document.getElementById('chatToggleBadge');
          var total = allNotifs.length;
          if (total > 0) {
            badge.textContent = total;
            badge.style.display = 'inline-block';
            toggleBadge.textContent = total;
            toggleBadge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
            toggleBadge.style.display = 'none';
          }
          renderNotifDropdown(allNotifs);
        } catch(e) {}
      }

      function renderNotifDropdown(notifs) {
        var dd = document.getElementById('chatNotifDropdown');
        if (!notifs.length) { dd.innerHTML = '<div class="chat-notif-empty">No unread mentions</div>'; return; }
        dd.innerHTML = notifs.map(function(n) {
          var isCurrent = n.context_type === chatContextType && n.context_id == chatContextId;
          var url = '';
          if (!isCurrent) {
            if (n.context_type === 'system') url = '/systems/' + n.context_id + '?chatMsg=' + n.message_id;
            else url = '/systems/' + (n.system_id || 0) + '/tasks/' + n.context_id + '?chatMsg=' + n.message_id;
          }
          return '<div class="chat-notif-item">' +
            '<div class="chat-notif-item-body">' +
              '<div class="chat-notif-item-sender">' + escapeHtml(n.sender) + '</div>' +
              '<div class="chat-notif-item-text">' + escapeHtml((n.body || '').substring(0, 80)) + '</div>' +
              '<div class="chat-notif-item-context">' + (n.context_type === 'system' ? 'System' : 'Task') + ' chat</div>' +
            '</div>' +
            (isCurrent
              ? '<button class="chat-notif-goto" onclick="gotoNotifMsg(' + n.message_id + ')">GoTo</button>'
              : '<a href="' + url + '" class="chat-notif-goto" style="text-decoration:none;">GoTo</a>') +
          '</div>';
        }).join('');
      }

      function toggleNotifDropdown(e) {
        e.stopPropagation();
        var dd = document.getElementById('chatNotifDropdown');
        dd.classList.toggle('open');
      }
      document.addEventListener('click', function(e) {
        var dd = document.getElementById('chatNotifDropdown');
        if (dd && !dd.contains(e.target) && e.target.id !== 'chatNotifBadge') dd.classList.remove('open');
      });

      function gotoNotifMsg(msgId) {
        document.getElementById('chatNotifDropdown').classList.remove('open');
        scrollToMsg(msgId);
        markNotificationsRead();
      }

      async function markNotificationsRead() {
        try {
          await fetch('/api/chat/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context_type: chatContextType, context_id: chatContextId })
          });
          document.getElementById('chatNotifBadge').style.display = 'none';
          document.getElementById('chatToggleBadge').style.display = 'none';
        } catch(e) {}
      }

      function showBrowserNotification(msg) {
        if ('Notification' in window && Notification.permission === 'granted' && msg.sender !== currentUsername) {
          var n = new Notification(msg.sender + ' mentioned you', { body: msg.body.substring(0, 100), icon: _pp[msg.sender] || undefined });
          n.onclick = function() { window.focus(); gotoNotifMsg(msg.id); n.close(); };
          setTimeout(function() { n.close(); }, 5000);
        }
      }

      function openThread(parentId) {
        threadParentId = parentId;
        document.getElementById('threadPanel').classList.add('open');
        loadThread(parentId);
      }

      function closeThread() {
        threadParentId = null;
        document.getElementById('threadPanel').classList.remove('open');
      }

      async function loadThread(parentId) {
        try {
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId + '/thread/' + parentId);
          var data = await resp.json();
          var parentContainer = document.getElementById('threadParent');
          var repliesContainer = document.getElementById('threadReplies');
          if (data.parent) { parentContainer.innerHTML = ''; parentContainer.appendChild(renderChatMsg(data.parent, true)); }
          repliesContainer.innerHTML = '';
          var prevMsg = null;
          (data.replies || []).forEach(function(msg) {
            repliesContainer.appendChild(renderChatMsg(msg, isNewGroup(msg, prevMsg)));
            prevMsg = msg;
          });
          repliesContainer.scrollTop = repliesContainer.scrollHeight;
        } catch(e) { console.error('Error loading thread:', e); }
      }

      async function sendThreadMessage() {
        if (!threadParentId) return;
        var input = document.getElementById('threadInput');
        var body = input.value.trim();
        if (!body) return;
        try {
          var payload = { body: body, parent_id: threadParentId };
          if (threadReplyTo) payload.reply_to_id = threadReplyTo;
          var resp = await fetch('/api/chat/' + chatContextType + '/' + chatContextId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          var data = await resp.json();
          if (data.message) {
            var repliesContainer = document.getElementById('threadReplies');
            var msgs = repliesContainer.querySelectorAll('.chat-msg-group');
            var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
            repliesContainer.appendChild(renderChatMsg(data.message, isNewGroup(data.message, prevMsg)));
            repliesContainer.scrollTop = repliesContainer.scrollHeight;
            socket.emit('chat-new-message', { room: room, message: data.message });
            input.value = '';
            input.style.height = 'auto';
            cancelThreadReply();
            var badge = document.querySelector('[data-msg-id="' + threadParentId + '"] .chat-msg-thread-badge');
            if (badge) {
              var count = parseInt(badge.textContent.match(/\\d+/)) + 1;
              badge.innerHTML = '🧵 ' + count + ' repl' + (count === 1 ? 'y' : 'ies');
            } else {
              var parentEl = document.querySelector('[data-msg-id="' + threadParentId + '"] .chat-msg-body');
              if (parentEl) {
                var b = document.createElement('div');
                b.className = 'chat-msg-thread-badge';
                b.setAttribute('onclick', 'openThread(' + threadParentId + ')');
                b.innerHTML = '🧵 1 reply';
                parentEl.appendChild(b);
              }
            }
          }
        } catch(e) { console.error('Error sending thread message:', e); }
      }

      function cancelThreadReply() {
        threadReplyTo = null;
        document.getElementById('threadReplyBar').classList.remove('active');
      }

      function threadKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendThreadMessage(); }
      }

      function threadInputHandler(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        handleMentionAutocomplete(textarea, 'threadMentionDropdown', true);
      }

      // Socket chat events
      socket.on('chat-message-received', function(data) {
        if (!data.message) return;
        var msg = data.message;
        if (msg.sender === currentUsername) return;
        if (msg.parent_id) {
          if (threadParentId === msg.parent_id) {
            var repliesContainer = document.getElementById('threadReplies');
            var msgs = repliesContainer.querySelectorAll('.chat-msg-group');
            var lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            var prevMsg = lastMsg ? { sender: lastMsg.getAttribute('data-sender'), created_at: lastMsg.getAttribute('data-time') } : null;
            repliesContainer.appendChild(renderChatMsg(msg, isNewGroup(msg, prevMsg)));
            repliesContainer.scrollTop = repliesContainer.scrollHeight;
          }
          var badge = document.querySelector('[data-msg-id="' + msg.parent_id + '"] .chat-msg-thread-badge');
          if (badge) {
            var count = parseInt(badge.textContent.match(/\\d+/)) + 1;
            badge.innerHTML = '🧵 ' + count + ' repl' + (count === 1 ? 'y' : 'ies');
          } else {
            var parentEl = document.querySelector('[data-msg-id="' + msg.parent_id + '"] .chat-msg-body');
            if (parentEl) {
              var b = document.createElement('div');
              b.className = 'chat-msg-thread-badge';
              b.setAttribute('onclick', 'openThread(' + msg.parent_id + ')');
              b.innerHTML = '🧵 1 reply';
              parentEl.appendChild(b);
            }
          }
        } else {
          appendChatMessage(msg);
        }
        if (msg.body && msg.body.indexOf('@' + currentUsername) !== -1) {
          showBrowserNotification(msg);
          loadNotifications();
        }
      });

      socket.on('chat-message-updated', function(data) {
        var el = document.querySelector('[data-msg-id="' + data.messageId + '"]');
        if (el) { var t = el.querySelector('.chat-msg-text'); if (t) t.innerHTML = renderChatBody(data.body, false) + '<span class="chat-msg-edited">(edited)</span>'; }
        if (threadParentId) {
          var tel = document.querySelector('#threadReplies [data-msg-id="' + data.messageId + '"], #threadParent [data-msg-id="' + data.messageId + '"]');
          if (tel) { var tt = tel.querySelector('.chat-msg-text'); if (tt) tt.innerHTML = renderChatBody(data.body, false) + '<span class="chat-msg-edited">(edited)</span>'; }
        }
      });

      socket.on('chat-message-removed', function(data) {
        var el = document.querySelector('[data-msg-id="' + data.messageId + '"]');
        if (el) {
          el.classList.add('chat-msg-deleted');
          var t = el.querySelector('.chat-msg-text'); if (t) t.innerHTML = '<em>[message deleted]</em>';
          var a = el.querySelector('.chat-msg-actions'); if (a) a.remove();
        }
      });

      socket.on('chat-user-typing', function(data) {
        if (data.username === currentUsername) return;
        typingUsers[data.username] = true;
        updateTypingIndicator();
      });

      socket.on('chat-user-stop-typing', function(data) {
        delete typingUsers[data.username];
        updateTypingIndicator();
      });

      var chatMessagesEl = document.getElementById('chatMessages');
      var chatObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) markNotificationsRead();
      }, { threshold: 0.5 });
      chatObserver.observe(chatMessagesEl);

      loadChat();

      // Auto-open chat and scroll to message if ?chatMsg= is in URL
      (function() {
        var params = new URLSearchParams(window.location.search);
        var chatMsgId = params.get('chatMsg');
        if (chatMsgId) {
          var panel = document.getElementById('chatPanel');
          var overlay = document.getElementById('chatPanelOverlay');
          panel.classList.add('open');
          overlay.classList.add('open');
          setTimeout(function() { scrollToMsg(parseInt(chatMsgId)); }, 600);
        }
      })();
    </script>
  </body>
  </html>
  `;
}


function myTasksPage(opts) {
  const { tasks, systems, users, viewUser, currentUser, admin, escapeHtml, profilePictures } = opts;
  const pp = profilePictures || {};
  
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
      renderAvatar(a, pp, { size: 24, fontSize: 11, title: escapeHtml(a) })
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
      .avatar-sm { width: 22px; height: 22px; font-size: 10px; overflow: hidden; }
      .avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
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
        <a href="/profile">Profile</a>
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
        <a href="/profile">Profile</a>
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


module.exports = {
  systemsListPage,
  systemDetailPage,
  taskDetailPage,
  myTasksPage,
  historyPage,
};
