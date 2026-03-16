const { systemsBaseCss } = require('./shared');

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
        <a href="/profile">Profile</a>
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
  const { roadmap, milestones, systems, tasks, allRoadmaps, currentUser, admin, escapeHtml, profilePictures } = opts;
  const pp = profilePictures || {};

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
        <a href="/profile">Profile</a>
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
    const _pp = ${JSON.stringify(pp)};
    function _av(name, title, size, cls) {
      size = size || 28; cls = cls || 'slt-avatar';
      if (_pp[name]) return '<img src="' + _pp[name] + '" alt="' + escHtml(name) + '" title="' + escHtml(title || name) + '" class="' + cls + '" style="width:'+size+'px;height:'+size+'px;border-radius:50%;object-fit:cover;">';
      var ini = (name||'?').split(/\s+/).map(function(w){return w[0]}).join('').toUpperCase().slice(0, 2);
      return '<span class="' + cls + '" title="' + escHtml(title || name) + '">' + ini + '</span>';
    }
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
                          avatarsHtml += _av(p, p, 18, 'slt-avatar');
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
          html += _av(p, p, 20, 'tp-avatar');
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
  roadmapsListPage,
  roadmapDetailPage,
};
