const path = require("path");
const fs = require("fs");

module.exports = function registerRoadmapRoutes(app, deps) {
	const { db, isAdmin, getCurrentUser, escapeHtml, upload, views, uploadDir } = deps;

	// ── Promise wrappers ──
	const dbRun = (sql, params = []) =>
		new Promise((resolve, reject) => {
			db.run(sql, params, function (err) {
				if (err) return reject(err);
				resolve({ lastID: this.lastID, changes: this.changes });
			});
		});

	const dbAll = (sql, params = []) =>
		new Promise((resolve, reject) => {
			db.all(sql, params, (err, rows) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});

	const dbGet = (sql, params = []) =>
		new Promise((resolve, reject) => {
			db.get(sql, params, (err, row) => {
				if (err) return reject(err);
				resolve(row || null);
			});
		});

	// ==================== PAGE ROUTES ====================

	// Roadmaps list page
	app.get("/roadmaps", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.redirect("/login");

		try {
			const roadmaps = await dbAll("SELECT * FROM roadmaps ORDER BY id DESC");

			// Get milestone counts per roadmap
			for (const rm of roadmaps) {
				const stats = await dbGet(`
					SELECT
						COUNT(*) as total,
						SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
						SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress
					FROM roadmap_milestones WHERE roadmap_id = ?
				`, [rm.id]);
				rm.totalMilestones = stats ? stats.total : 0;
				rm.completedMilestones = stats ? stats.completed : 0;
				rm.inProgressMilestones = stats ? stats.in_progress : 0;
			}

			res.send(views.roadmapsListPage({
				roadmaps,
				currentUser,
				admin,
			}));
		} catch (err) {
			console.error("Error loading roadmaps:", err);
			res.status(500).send("Error loading roadmaps");
		}
	});

	// Roadmap detail / timeline page
	app.get("/roadmaps/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.redirect("/login");

		try {
			const roadmap = await dbGet("SELECT * FROM roadmaps WHERE id = ?", [req.params.id]);
			if (!roadmap) return res.status(404).send("Roadmap not found");

			const milestones = await dbAll(
				"SELECT * FROM roadmap_milestones WHERE roadmap_id = ? ORDER BY position ASC, due_date ASC, id ASC",
				[req.params.id]
			);

			// Attach info for each milestone
			for (const ms of milestones) {
				ms.attachments = await dbAll(
					"SELECT * FROM roadmap_attachments WHERE milestone_id = ? ORDER BY uploaded_at DESC",
					[ms.id]
				);
				// If linked to a task, fetch task info
				if (ms.task_id) {
					ms.linkedTask = await dbGet(
						"SELECT st.*, s.name as system_name FROM system_tasks st LEFT JOIN systems s ON st.system_id = s.id WHERE st.id = ?",
						[ms.task_id]
					);
				}
				// Load steps (sub-timeline)
				ms.steps = await dbAll(
					"SELECT * FROM milestone_steps WHERE milestone_id = ? ORDER BY position ASC, id ASC",
					[ms.id]
				);
				// Load linked tasks for each step
				for (const step of ms.steps) {
					step.linkedTasks = await dbAll(
						`SELECT st2.task_id, t.title, t.is_completed, t.assigned_to, t.priority, t.due_date, s.name as system_name, s.id as system_id, s.color as system_color
						 FROM step_tasks st2
						 LEFT JOIN system_tasks t ON st2.task_id = t.id
						 LEFT JOIN systems s ON t.system_id = s.id
						 WHERE st2.step_id = ? ORDER BY st2.id ASC`,
						[step.id]
					);
				}
			}

			// Get all systems + tasks for the "attach task" picker
			const systems = await dbAll("SELECT * FROM systems ORDER BY name ASC");
			const tasks = await dbAll("SELECT st.*, s.name as system_name FROM system_tasks st LEFT JOIN systems s ON st.system_id = s.id ORDER BY s.name ASC, st.title ASC");

			// Get all roadmaps for the switcher
			const allRoadmaps = await dbAll("SELECT id, name, color FROM roadmaps ORDER BY id DESC");

			res.send(views.roadmapDetailPage({
				roadmap,
				milestones,
				systems,
				tasks,
				allRoadmaps,
				currentUser,
				admin,
				escapeHtml,
			}));
		} catch (err) {
			console.error("Error loading roadmap:", err);
			res.status(500).send("Error loading roadmap");
		}
	});

	// ==================== API ROUTES ====================

	// Create a new roadmap
	app.post("/api/roadmaps", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { name, description, color } = req.body;
			if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });

			const now = new Date().toISOString();
			const result = await dbRun(
				"INSERT INTO roadmaps (name, description, color, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
				[name.trim(), description || "", color || "#2563eb", currentUser || "admin", now, now]
			);

			res.json({ id: result.lastID, success: true });
		} catch (err) {
			console.error("Error creating roadmap:", err);
			res.status(500).json({ error: "Failed to create roadmap" });
		}
	});

	// Update roadmap
	app.put("/api/roadmaps/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { name, description, color } = req.body;
			const now = new Date().toISOString();
			await dbRun(
				"UPDATE roadmaps SET name = ?, description = ?, color = ?, updated_at = ? WHERE id = ?",
				[name, description || "", color || "#2563eb", now, req.params.id]
			);
			res.json({ success: true });
		} catch (err) {
			console.error("Error updating roadmap:", err);
			res.status(500).json({ error: "Failed to update roadmap" });
		}
	});

	// Delete roadmap (cascade deletes milestones + attachments)
	app.delete("/api/roadmaps/:id", async (req, res) => {
		if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });

		try {
			// Delete attachment files
			const attachments = await dbAll(
				"SELECT ra.* FROM roadmap_attachments ra JOIN roadmap_milestones rm ON ra.milestone_id = rm.id WHERE rm.roadmap_id = ?",
				[req.params.id]
			);
			for (const att of attachments) {
				const filePath = path.join(uploadDir, att.filename);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			}

			await dbRun("DELETE FROM roadmap_attachments WHERE milestone_id IN (SELECT id FROM roadmap_milestones WHERE roadmap_id = ?)", [req.params.id]);
			await dbRun("DELETE FROM roadmap_milestones WHERE roadmap_id = ?", [req.params.id]);
			await dbRun("DELETE FROM roadmaps WHERE id = ?", [req.params.id]);

			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting roadmap:", err);
			res.status(500).json({ error: "Failed to delete roadmap" });
		}
	});

	// ── Milestone CRUD ──

	// Create milestone
	app.post("/api/roadmaps/:roadmapId/milestones", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { title, description, content, due_date, status, color, task_id, system_id, google_docs_url } = req.body;
			if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

			// Get position (put at end)
			const last = await dbGet(
				"SELECT MAX(position) as maxPos FROM roadmap_milestones WHERE roadmap_id = ?",
				[req.params.roadmapId]
			);
			const position = (last && last.maxPos != null) ? last.maxPos + 1 : 0;

			const now = new Date().toISOString();
			const result = await dbRun(
				`INSERT INTO roadmap_milestones
					(roadmap_id, title, description, content, due_date, status, position, color, task_id, system_id, google_docs_url, created_by, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					req.params.roadmapId, title.trim(), description || "", content || "",
					due_date || null, status || "not-started", position,
					color || "#2563eb", task_id || null, system_id || null,
					google_docs_url || null, currentUser || "admin", now, now
				]
			);

			res.json({ id: result.lastID, success: true });
		} catch (err) {
			console.error("Error creating milestone:", err);
			res.status(500).json({ error: "Failed to create milestone" });
		}
	});

	// Update milestone
	app.put("/api/milestones/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { title, description, content, due_date, status, color, task_id, system_id, google_docs_url } = req.body;
			const now = new Date().toISOString();

			const milestone = await dbGet("SELECT * FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			if (!milestone) return res.status(404).json({ error: "Milestone not found" });

			const completedAt = (status === "completed" && milestone.status !== "completed")
				? now
				: (status !== "completed" ? null : milestone.completed_at);

			await dbRun(
				`UPDATE roadmap_milestones SET
					title = ?, description = ?, content = ?, due_date = ?, status = ?,
					color = ?, task_id = ?, system_id = ?, google_docs_url = ?,
					updated_at = ?, completed_at = ?
				WHERE id = ?`,
				[
					title, description || "", content || "", due_date || null,
					status || "not-started", color || "#2563eb",
					task_id || null, system_id || null, google_docs_url || null,
					now, completedAt, req.params.id
				]
			);

			res.json({ success: true });
		} catch (err) {
			console.error("Error updating milestone:", err);
			res.status(500).json({ error: "Failed to update milestone" });
		}
	});

	// Delete milestone
	app.delete("/api/milestones/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			// Delete attachment files
			const attachments = await dbAll("SELECT * FROM roadmap_attachments WHERE milestone_id = ?", [req.params.id]);
			for (const att of attachments) {
				const filePath = path.join(uploadDir, att.filename);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			}

			await dbRun("DELETE FROM roadmap_attachments WHERE milestone_id = ?", [req.params.id]);
			await dbRun("DELETE FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting milestone:", err);
			res.status(500).json({ error: "Failed to delete milestone" });
		}
	});

	// Reorder milestones
	app.post("/api/roadmaps/:roadmapId/milestones/reorder", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { order } = req.body; // array of milestone IDs in new order
			if (!Array.isArray(order)) return res.status(400).json({ error: "Invalid order" });

			for (let i = 0; i < order.length; i++) {
				await dbRun("UPDATE roadmap_milestones SET position = ? WHERE id = ? AND roadmap_id = ?", [i, order[i], req.params.roadmapId]);
			}

			res.json({ success: true });
		} catch (err) {
			console.error("Error reordering milestones:", err);
			res.status(500).json({ error: "Failed to reorder" });
		}
	});

	// ── Milestone attachments ──

	// Upload attachments to a milestone
	app.post("/api/milestones/:id/attachments", upload.array("files", 10), async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const milestone = await dbGet("SELECT * FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			if (!milestone) return res.status(404).json({ error: "Milestone not found" });

			const now = new Date().toISOString();
			const inserted = [];
			for (const file of (req.files || [])) {
				const result = await dbRun(
					"INSERT INTO roadmap_attachments (milestone_id, filename, original_name, mime_type, size, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
					[req.params.id, file.filename, file.originalname, file.mimetype, file.size, currentUser || "admin", now]
				);
				inserted.push({ id: result.lastID, filename: file.filename, original_name: file.originalname, mime_type: file.mimetype, size: file.size });
			}

			res.json({ success: true, attachments: inserted });
		} catch (err) {
			console.error("Error uploading attachments:", err);
			res.status(500).json({ error: "Failed to upload" });
		}
	});

	// Delete attachment
	app.delete("/api/roadmap-attachments/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const att = await dbGet("SELECT * FROM roadmap_attachments WHERE id = ?", [req.params.id]);
			if (!att) return res.status(404).json({ error: "Attachment not found" });

			const filePath = path.join(uploadDir, att.filename);
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

			await dbRun("DELETE FROM roadmap_attachments WHERE id = ?", [req.params.id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting attachment:", err);
			res.status(500).json({ error: "Failed to delete attachment" });
		}
	});

	// ── Link existing task to milestone ──
	app.post("/api/milestones/:id/link-task", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { task_id } = req.body;
			if (!task_id) return res.status(400).json({ error: "task_id required" });

			const task = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [task_id]);
			if (!task) return res.status(404).json({ error: "Task not found" });

			await dbRun(
				"UPDATE roadmap_milestones SET task_id = ?, system_id = ?, updated_at = ? WHERE id = ?",
				[task_id, task.system_id, new Date().toISOString(), req.params.id]
			);

			res.json({ success: true });
		} catch (err) {
			console.error("Error linking task:", err);
			res.status(500).json({ error: "Failed to link task" });
		}
	});

	// Unlink task from milestone
	app.post("/api/milestones/:id/unlink-task", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			await dbRun(
				"UPDATE roadmap_milestones SET task_id = NULL, system_id = NULL, updated_at = ? WHERE id = ?",
				[new Date().toISOString(), req.params.id]
			);
			res.json({ success: true });
		} catch (err) {
			console.error("Error unlinking task:", err);
			res.status(500).json({ error: "Failed to unlink task" });
		}
	});

	// ── Milestone Steps (sub-timeline) ──

	// Create step
	app.post("/api/milestones/:id/steps", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const milestone = await dbGet("SELECT * FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			if (!milestone) return res.status(404).json({ error: "Milestone not found" });

			const { title, description, duration_days, status, task_id, start_date, end_date } = req.body;
			if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

			// Compute duration from dates if provided
			let computedDuration = duration_days || 1;
			if (start_date && end_date) {
				const diffMs = new Date(end_date + 'T00:00:00') - new Date(start_date + 'T00:00:00');
				computedDuration = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
			}

			// Get next position
			const last = await dbGet(
				"SELECT MAX(position) as maxPos FROM milestone_steps WHERE milestone_id = ?",
				[req.params.id]
			);
			const position = (last && last.maxPos != null) ? last.maxPos + 1 : 0;

			const now = new Date().toISOString();
			const result = await dbRun(
				`INSERT INTO milestone_steps (milestone_id, title, description, duration_days, status, position, task_id, start_date, end_date, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[req.params.id, title.trim(), description || "", computedDuration, status || "not-started", position, task_id || null, start_date || null, end_date || null, now, now]
			);

			res.json({ id: result.lastID, success: true, position });
		} catch (err) {
			console.error("Error creating step:", err);
			res.status(500).json({ error: "Failed to create step" });
		}
	});

	// Update step
	app.put("/api/steps/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const step = await dbGet("SELECT * FROM milestone_steps WHERE id = ?", [req.params.id]);
			if (!step) return res.status(404).json({ error: "Step not found" });

			const { title, description, duration_days, status, task_id, start_date, end_date } = req.body;
			const now = new Date().toISOString();

			// Compute duration from dates if provided
			const sd = start_date !== undefined ? start_date : step.start_date;
			const ed = end_date !== undefined ? end_date : step.end_date;
			let computedDuration = duration_days || step.duration_days;
			if (sd && ed) {
				const diffMs = new Date(ed + 'T00:00:00') - new Date(sd + 'T00:00:00');
				computedDuration = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
			}

			const completedAt = (status === "completed" && step.status !== "completed")
				? now
				: (status !== "completed" ? null : step.completed_at);

			await dbRun(
				`UPDATE milestone_steps SET title = ?, description = ?, duration_days = ?, status = ?, task_id = ?, start_date = ?, end_date = ?, updated_at = ?, completed_at = ? WHERE id = ?`,
				[title || step.title, description !== undefined ? description : step.description, computedDuration, status || step.status, task_id !== undefined ? task_id : step.task_id, sd || null, ed || null, now, completedAt, req.params.id]
			);

			res.json({ success: true });
		} catch (err) {
			console.error("Error updating step:", err);
			res.status(500).json({ error: "Failed to update step" });
		}
	});

	// Delete step
	app.delete("/api/steps/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			await dbRun("DELETE FROM step_tasks WHERE step_id = ?", [req.params.id]);
			await dbRun("DELETE FROM milestone_steps WHERE id = ?", [req.params.id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting step:", err);
			res.status(500).json({ error: "Failed to delete step" });
		}
	});

	// ── Step Tasks (multi-task linking) ──

	// Add task to step
	app.post("/api/steps/:id/tasks", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { task_id } = req.body;
			if (!task_id) return res.status(400).json({ error: "task_id is required" });

			const step = await dbGet("SELECT * FROM milestone_steps WHERE id = ?", [req.params.id]);
			if (!step) return res.status(404).json({ error: "Step not found" });

			const existing = await dbGet("SELECT * FROM step_tasks WHERE step_id = ? AND task_id = ?", [req.params.id, task_id]);
			if (existing) return res.json({ success: true, message: "Already linked" });

			const now = new Date().toISOString();
			await dbRun(
				"INSERT INTO step_tasks (step_id, task_id, created_at) VALUES (?, ?, ?)",
				[req.params.id, task_id, now]
			);

			// Return the task info
			const task = await dbGet(
				`SELECT t.id as task_id, t.title, t.is_completed, t.assigned_to, t.priority, t.due_date, s.name as system_name, s.id as system_id, s.color as system_color
				 FROM system_tasks t LEFT JOIN systems s ON t.system_id = s.id WHERE t.id = ?`,
				[task_id]
			);

			res.json({ success: true, task });
		} catch (err) {
			console.error("Error adding task to step:", err);
			res.status(500).json({ error: "Failed to add task" });
		}
	});

	// Remove task from step
	app.delete("/api/steps/:stepId/tasks/:taskId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			await dbRun("DELETE FROM step_tasks WHERE step_id = ? AND task_id = ?", [req.params.stepId, req.params.taskId]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error removing task from step:", err);
			res.status(500).json({ error: "Failed to remove task" });
		}
	});

	// Reorder steps
	app.post("/api/milestones/:id/steps/reorder", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const { order } = req.body;
			if (!Array.isArray(order)) return res.status(400).json({ error: "Invalid order" });

			for (let i = 0; i < order.length; i++) {
				await dbRun("UPDATE milestone_steps SET position = ? WHERE id = ? AND milestone_id = ?", [i, order[i], req.params.id]);
			}

			res.json({ success: true });
		} catch (err) {
			console.error("Error reordering steps:", err);
			res.status(500).json({ error: "Failed to reorder" });
		}
	});

	// Bulk-create steps from a template
	app.post("/api/milestones/:id/steps/template", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const milestone = await dbGet("SELECT * FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			if (!milestone) return res.status(404).json({ error: "Milestone not found" });

			const { template } = req.body;
			const templates = {
				'standard-dev': [
					{ title: 'Core Development', duration_days: 3, description: 'Main implementation work' },
					{ title: 'Testing', duration_days: 1, description: 'Unit and integration testing' },
					{ title: 'Polishing & Fixes', duration_days: 1, description: 'Bug fixes and code cleanup' },
					{ title: 'Testing Again', duration_days: 1, description: 'Regression and final testing' },
					{ title: 'Final Polish', duration_days: 1, description: 'Final adjustments and documentation' },
				],
				'quick-task': [
					{ title: 'Implementation', duration_days: 1, description: 'Build the feature' },
					{ title: 'Review & Test', duration_days: 0.5, description: 'Code review and testing' },
					{ title: 'Deploy', duration_days: 0.5, description: 'Ship it' },
				],
				'research': [
					{ title: 'Research & Planning', duration_days: 2, description: 'Gather information and plan approach' },
					{ title: 'Prototype', duration_days: 2, description: 'Build a proof of concept' },
					{ title: 'Review Findings', duration_days: 1, description: 'Evaluate results and present' },
				],
				'release': [
					{ title: 'Feature Freeze', duration_days: 1, description: 'Lock features, start stabilization' },
					{ title: 'QA Testing', duration_days: 2, description: 'Quality assurance pass' },
					{ title: 'Bug Fixes', duration_days: 1, description: 'Fix issues found in QA' },
					{ title: 'Staging Deploy', duration_days: 0.5, description: 'Deploy to staging environment' },
					{ title: 'Final Verification', duration_days: 0.5, description: 'Verify staging deployment' },
					{ title: 'Production Release', duration_days: 0.5, description: 'Ship to production' },
				],
			};

			const steps = templates[template];
			if (!steps) return res.status(400).json({ error: "Unknown template" });

			// Get current max position
			const last = await dbGet("SELECT MAX(position) as maxPos FROM milestone_steps WHERE milestone_id = ?", [req.params.id]);
			let pos = (last && last.maxPos != null) ? last.maxPos + 1 : 0;

			const now = new Date().toISOString();
			const ids = [];
			for (const s of steps) {
				const result = await dbRun(
					`INSERT INTO milestone_steps (milestone_id, title, description, duration_days, status, position, created_at, updated_at)
					VALUES (?, ?, ?, ?, 'not-started', ?, ?, ?)`,
					[req.params.id, s.title, s.description, s.duration_days, pos++, now, now]
				);
				ids.push({ id: result.lastID, ...s, status: 'not-started', position: pos - 1 });
			}

			res.json({ success: true, steps: ids });
		} catch (err) {
			console.error("Error applying template:", err);
			res.status(500).json({ error: "Failed to apply template" });
		}
	});

	// Finalize milestone (different modes)
	app.post("/api/milestones/:id/finalize", async (req, res) => {
		const currentUser = getCurrentUser(req);
		if (!currentUser && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

		try {
			const milestone = await dbGet("SELECT * FROM roadmap_milestones WHERE id = ?", [req.params.id]);
			if (!milestone) return res.status(404).json({ error: "Milestone not found" });

			const { mode, notes } = req.body;
			const now = new Date().toISOString();

			// Complete all remaining steps
			await dbRun(
				"UPDATE milestone_steps SET status = 'completed', completed_at = ?, updated_at = ? WHERE milestone_id = ? AND status != 'completed'",
				[now, now, req.params.id]
			);

			// Update milestone
			let newContent = milestone.content || '';
			if (notes) {
				newContent += (newContent ? '\n\n' : '') + '--- Finalized (' + mode + ') ---\n' + notes;
			}

			await dbRun(
				"UPDATE roadmap_milestones SET status = 'completed', completed_at = ?, updated_at = ?, content = ? WHERE id = ?",
				[now, now, newContent, req.params.id]
			);

			res.json({ success: true, mode });
		} catch (err) {
			console.error("Error finalizing milestone:", err);
			res.status(500).json({ error: "Failed to finalize" });
		}
	});
};
