const path = require("path");
const fs = require("fs");

module.exports = function registerSystemsRoutes(app, deps) {
	const { db, isAdmin, getCurrentUser, escapeHtml, upload, views, uploadDir } = deps;

	// Helper to run db operations as promises
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

	// Systems list page
	app.get("/systems", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		try {
			const filterAssigned = req.query.assigned || "";
			const filterTag = req.query.tag || "";
			
			let systems = await dbAll(
				"SELECT * FROM systems ORDER BY position ASC, id DESC"
			);
			
			// Get tasks for each system
			const tasks = await dbAll(
				"SELECT * FROM system_tasks ORDER BY position ASC, id ASC"
			);
			const tasksBySystem = {};
			for (const task of tasks) {
				if (!tasksBySystem[task.system_id]) {
					tasksBySystem[task.system_id] = [];
				}
				tasksBySystem[task.system_id].push(task);
			}
			
			systems = systems.map(s => ({
				...s,
				tasks: tasksBySystem[s.id] || []
			}));
			
			// Apply filters
			if (filterAssigned) {
				systems = systems.filter(s => 
					s.tasks.some(t => t.assigned_to === filterAssigned)
				);
			}
			if (filterTag) {
				systems = systems.filter(s => 
					s.tags && s.tags.split(',').map(t => t.trim()).includes(filterTag)
				);
			}
			
			const users = await dbAll("SELECT username FROM users ORDER BY username");
			
			res.send(views.systemsListPage({
				systems,
				users,
				currentUser,
				admin,
				filterAssigned,
				filterTag
			}));
		} catch (err) {
			console.error("Error loading systems page:", err);
			res.status(500).send("Error loading systems");
		}
	});

	// Create new system (form POST)
	app.post("/systems/new", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		const { name, description, color, tags } = req.body;
		if (!name || !name.trim()) {
			return res.redirect("/systems");
		}

		try {
			const maxPos = await dbGet("SELECT MAX(position) as maxPos FROM systems");
			const position = (maxPos?.maxPos || 0) + 1;
			const now = new Date().toISOString();

			const result = await dbRun(
				`INSERT INTO systems (name, description, color, tags, position, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[name.trim(), description || "", color || "#3b82f6", tags || "", position, currentUser || "admin", now, now]
			);

			res.redirect("/systems/" + result.lastID);
		} catch (err) {
			console.error("Error creating system:", err);
			res.redirect("/systems");
		}
	});

	// My Tasks page - shows all tasks assigned to a user
	app.get("/my-tasks", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		try {
			// Allow viewing other users' tasks via query param
			const viewUser = req.query.user || currentUser || "admin";
			
			// Get all users for the dropdown
			const users = await dbAll("SELECT username FROM users ORDER BY username");
			
			// Get all tasks assigned to the selected user with system info
			const tasks = await dbAll(
				`SELECT t.*, s.name as system_name, s.color as system_color, s.id as system_id
				 FROM system_tasks t
				 LEFT JOIN systems s ON t.system_id = s.id
				 WHERE t.assigned_to = ?
				 ORDER BY t.is_completed ASC, t.due_date ASC, t.priority DESC, t.created_at DESC`,
				[viewUser]
			);
			
			// Get all systems this user is associated with (created by or has tasks in)
			const systems = await dbAll(
				`SELECT DISTINCT s.* FROM systems s
				 LEFT JOIN system_tasks t ON s.id = t.system_id
				 WHERE s.created_by = ? OR t.assigned_to = ?
				 ORDER BY s.name ASC`,
				[viewUser, viewUser]
			);
			
			res.send(views.myTasksPage({
				tasks,
				systems,
				users,
				viewUser,
				currentUser: currentUser || "admin",
				admin,
				escapeHtml
			}));
		} catch (err) {
			console.error("Error loading my tasks page:", err);
			res.status(500).send("Error loading tasks");
		}
	});

	// Global history page (must be before :id route)
	app.get("/systems/history", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		try {
			// Get system history
			const systemHistory = await dbAll(
				`SELECT sh.*, s.name as current_name, 'system' as type 
				 FROM system_history sh 
				 LEFT JOIN systems s ON sh.system_id = s.id 
				 ORDER BY sh.changed_at DESC LIMIT 100`
			);

			// Get task history
			const taskHistory = await dbAll(
				`SELECT th.*, t.title as current_title, t.system_id, s.name as system_name, 'task' as type 
				 FROM task_history th 
				 LEFT JOIN system_tasks t ON th.task_id = t.id 
				 LEFT JOIN systems s ON t.system_id = s.id 
				 ORDER BY th.changed_at DESC LIMIT 100`
			);

			// Combine and sort
			const combined = [...systemHistory, ...taskHistory]
				.sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
				.slice(0, 100);

			res.send(views.historyPage({ history: combined, currentUser, admin, escapeHtml }));
		} catch (err) {
			console.error("Error loading history page:", err);
			res.status(500).send("Error loading history");
		}
	});

	// System detail page
	app.get("/systems/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		try {
			const system = await dbGet("SELECT * FROM systems WHERE id = ?", [req.params.id]);
			if (!system) {
				return res.status(404).send("System not found");
			}

			const tasks = await dbAll(
				"SELECT * FROM system_tasks WHERE system_id = ? ORDER BY is_completed ASC, position ASC, id DESC",
				[system.id]
			);
			
			const attachments = await dbAll(
				"SELECT * FROM system_attachments WHERE system_id = ? AND task_id IS NULL ORDER BY id DESC",
				[system.id]
			);
			
			const users = await dbAll("SELECT username FROM users ORDER BY username");

			res.send(views.systemDetailPage({
				system: { ...system, tasks, attachments },
				users,
				currentUser,
				admin,
				escapeHtml
			}));
		} catch (err) {
			console.error("Error loading system:", err);
			res.status(500).send("Error loading system");
		}
	});

	// Create new task (form POST)
	app.post("/systems/:id/tasks/new", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		const systemId = req.params.id;
		const { title, description, assigned_to, priority, due_date, tags } = req.body;

		if (!title || !title.trim()) {
			return res.redirect("/systems/" + systemId);
		}

		try {
			const maxPos = await dbGet(
				"SELECT MAX(position) as maxPos FROM system_tasks WHERE system_id = ?",
				[systemId]
			);
			const position = (maxPos?.maxPos || 0) + 1;
			const now = new Date().toISOString();

			const result = await dbRun(
				`INSERT INTO system_tasks (system_id, title, description, assigned_to, priority, due_date, tags, position, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[systemId, title.trim(), description || "", assigned_to || null, priority || "medium", due_date || null, tags || "", position, currentUser || "admin", now, now]
			);

			res.redirect("/systems/" + systemId + "/tasks/" + result.lastID);
		} catch (err) {
			console.error("Error creating task:", err);
			res.redirect("/systems/" + systemId);
		}
	});

	// Task detail page
	app.get("/systems/:systemId/tasks/:taskId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.redirect("/login");
		}

		try {
			const system = await dbGet("SELECT * FROM systems WHERE id = ?", [req.params.systemId]);
			if (!system) {
				return res.status(404).send("System not found");
			}

			const task = await dbGet("SELECT * FROM system_tasks WHERE id = ? AND system_id = ?", [req.params.taskId, req.params.systemId]);
			if (!task) {
				return res.status(404).send("Task not found");
			}

			const checklist = await dbAll(
				"SELECT * FROM task_checklist WHERE task_id = ? ORDER BY position ASC, id ASC",
				[task.id]
			);
			
			const attachments = await dbAll(
				"SELECT * FROM system_attachments WHERE task_id = ? ORDER BY id DESC",
				[task.id]
			);
			
			const users = await dbAll("SELECT username FROM users ORDER BY username");

			res.send(views.taskDetailPage({
				system,
				task,
				checklist,
				attachments,
				users,
				currentUser,
				admin,
				escapeHtml
			}));
		} catch (err) {
			console.error("Error loading task:", err);
			res.status(500).send("Error loading task");
		}
	});

	// ==================== SYSTEMS API ====================

	// Get all systems with their tasks
	app.get("/api/systems", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		try {
			const systems = await dbAll(
				"SELECT * FROM systems ORDER BY position ASC, id ASC"
			);
			const tasks = await dbAll(
				"SELECT * FROM system_tasks ORDER BY position ASC, id ASC"
			);

			const tasksBySystem = {};
			for (const task of tasks) {
				if (!tasksBySystem[task.system_id]) {
					tasksBySystem[task.system_id] = [];
				}
				tasksBySystem[task.system_id].push(task);
			}

			const result = systems.map((sys) => ({
				...sys,
				tasks: tasksBySystem[sys.id] || [],
			}));

			res.json(result);
		} catch (err) {
			console.error("Error fetching systems:", err);
			res.status(500).json({ error: "Failed to fetch systems" });
		}
	});

	// Create a new system
	app.post("/api/systems", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { name, description, color, tags } = req.body;
		if (!name || !name.trim()) {
			return res.status(400).json({ error: "Name is required" });
		}

		try {
			const maxPos = await dbGet(
				"SELECT MAX(position) as maxPos FROM systems"
			);
			const position = (maxPos?.maxPos || 0) + 1;
			const now = new Date().toISOString();

			const result = await dbRun(
				`INSERT INTO systems (name, description, color, tags, position, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[name.trim(), description || "", color || "#3b82f6", tags || "", position, currentUser || "admin", now, now]
			);

			const system = await dbGet("SELECT * FROM systems WHERE id = ?", [
				result.lastID,
			]);
			res.json({ ...system, tasks: [] });
		} catch (err) {
			console.error("Error creating system:", err);
			res.status(500).json({ error: "Failed to create system" });
		}
	});

	// Update a system
	app.put("/api/systems/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const { name, description, content, color, tags, is_collapsed } = req.body;
		const now = new Date().toISOString();

		try {
			const existing = await dbGet("SELECT * FROM systems WHERE id = ?", [id]);
			if (!existing) {
				return res.status(404).json({ error: "System not found" });
			}

			// Save to history before updating
			await dbRun(
				`INSERT INTO system_history (system_id, name, description, content, color, tags, changed_by, changed_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[id, existing.name, existing.description, existing.content, existing.color, existing.tags, currentUser || 'admin', now]
			);

			await dbRun(
				`UPDATE systems SET 
					name = COALESCE(?, name),
					description = COALESCE(?, description),
					content = COALESCE(?, content),
					color = COALESCE(?, color),
					tags = COALESCE(?, tags),
					is_collapsed = COALESCE(?, is_collapsed),
					updated_at = ?
				 WHERE id = ?`,
				[
					name !== undefined ? name : null,
					description !== undefined ? description : null,
					content !== undefined ? content : null,
					color !== undefined ? color : null,
					tags !== undefined ? tags : null,
					is_collapsed !== undefined ? (is_collapsed ? 1 : 0) : null,
					now,
					id,
				]
			);

			const updated = await dbGet("SELECT * FROM systems WHERE id = ?", [id]);
			res.json(updated);
		} catch (err) {
			console.error("Error updating system:", err);
			res.status(500).json({ error: "Failed to update system" });
		}
	});

	// Delete a system
	app.delete("/api/systems/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!admin) {
			return res.status(403).json({ error: "Admin only" });
		}

		const { id } = req.params;

		try {
			// Delete attachments
			await dbRun("DELETE FROM system_attachments WHERE system_id = ?", [id]);
			// Delete checklist items for tasks
			const tasks = await dbAll("SELECT id FROM system_tasks WHERE system_id = ?", [id]);
			for (const task of tasks) {
				await dbRun("DELETE FROM task_checklist WHERE task_id = ?", [task.id]);
				await dbRun("DELETE FROM system_attachments WHERE task_id = ?", [task.id]);
			}
			// Delete tasks
			await dbRun("DELETE FROM system_tasks WHERE system_id = ?", [id]);
			// Delete history
			await dbRun("DELETE FROM system_history WHERE system_id = ?", [id]);
			// Delete system
			await dbRun("DELETE FROM systems WHERE id = ?", [id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting system:", err);
			res.status(500).json({ error: "Failed to delete system" });
		}
	});

	// Get system history
	app.get("/api/systems/:id/history", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;

		try {
			const history = await dbAll(
				"SELECT * FROM system_history WHERE system_id = ? ORDER BY changed_at DESC",
				[id]
			);
			res.json(history);
		} catch (err) {
			console.error("Error fetching system history:", err);
			res.status(500).json({ error: "Failed to fetch history" });
		}
	});

	// Get single system history record
	app.get("/api/history/system/:historyId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		try {
			const record = await dbGet(
				"SELECT * FROM system_history WHERE id = ?",
				[req.params.historyId]
			);
			if (!record) {
				return res.status(404).json({ error: "History record not found" });
			}
			res.json(record);
		} catch (err) {
			console.error("Error fetching history record:", err);
			res.status(500).json({ error: "Failed to fetch history record" });
		}
	});

	// Get single task history record
	app.get("/api/history/task/:historyId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		try {
			const record = await dbGet(
				"SELECT * FROM task_history WHERE id = ?",
				[req.params.historyId]
			);
			if (!record) {
				return res.status(404).json({ error: "History record not found" });
			}
			res.json(record);
		} catch (err) {
			console.error("Error fetching history record:", err);
			res.status(500).json({ error: "Failed to fetch history record" });
		}
	});

	// Revert system to a previous version
	app.post("/api/systems/:id/revert/:historyId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id, historyId } = req.params;
		const now = new Date().toISOString();

		try {
			const historyRecord = await dbGet(
				"SELECT * FROM system_history WHERE id = ? AND system_id = ?",
				[historyId, id]
			);
			if (!historyRecord) {
				return res.status(404).json({ error: "History record not found" });
			}

			// Get current state and save to history first
			const current = await dbGet("SELECT * FROM systems WHERE id = ?", [id]);
			if (current) {
				await dbRun(
					`INSERT INTO system_history (system_id, name, description, content, color, tags, changed_by, changed_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[id, current.name, current.description, current.content, current.color, current.tags, currentUser || 'admin', now]
				);
			}

			// Revert to the history state
			await dbRun(
				`UPDATE systems SET 
					name = ?, description = ?, content = ?, color = ?, tags = ?, updated_at = ?
				 WHERE id = ?`,
				[historyRecord.name, historyRecord.description, historyRecord.content, historyRecord.color, historyRecord.tags, now, id]
			);

			const updated = await dbGet("SELECT * FROM systems WHERE id = ?", [id]);
			res.json(updated);
		} catch (err) {
			console.error("Error reverting system:", err);
			res.status(500).json({ error: "Failed to revert system" });
		}
	});

	// Upload attachments to system
	app.post("/api/systems/:id/attachments", upload.array("files", 10), async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const now = new Date().toISOString();

		try {
			const system = await dbGet("SELECT * FROM systems WHERE id = ?", [id]);
			if (!system) {
				return res.status(404).json({ error: "System not found" });
			}

			const attachments = [];
			for (const file of req.files || []) {
				const result = await dbRun(
					`INSERT INTO system_attachments (system_id, filename, original_name, mime_type, size, uploaded_by, uploaded_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[id, file.filename, file.originalname, file.mimetype, file.size, currentUser || "admin", now]
				);
				attachments.push({
					id: result.lastID,
					filename: file.filename,
					original_name: file.originalname,
					mime_type: file.mimetype
				});
			}

			res.json(attachments);
		} catch (err) {
			console.error("Error uploading attachments:", err);
			res.status(500).json({ error: "Failed to upload attachments" });
		}
	});

	// ==================== TASKS API ====================

	// Create a new task
	app.post("/api/systems/:systemId/tasks", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { systemId } = req.params;
		const { title, description, assigned_to, priority, due_date, tags } = req.body;

		if (!title || !title.trim()) {
			return res.status(400).json({ error: "Title is required" });
		}

		try {
			const system = await dbGet("SELECT * FROM systems WHERE id = ?", [systemId]);
			if (!system) {
				return res.status(404).json({ error: "System not found" });
			}

			const maxPos = await dbGet(
				"SELECT MAX(position) as maxPos FROM system_tasks WHERE system_id = ?",
				[systemId]
			);
			const position = (maxPos?.maxPos || 0) + 1;
			const now = new Date().toISOString();

			const result = await dbRun(
				`INSERT INTO system_tasks (system_id, title, description, assigned_to, priority, due_date, tags, position, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[systemId, title.trim(), description || "", assigned_to || null, priority || "medium", due_date || null, tags || "", position, currentUser || "admin", now, now]
			);

			const task = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [result.lastID]);
			res.json(task);
		} catch (err) {
			console.error("Error creating task:", err);
			res.status(500).json({ error: "Failed to create task" });
		}
	});

	// Update a task
	app.put("/api/tasks/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const { title, description, content, is_completed, assigned_to, priority, due_date, tags } = req.body;
		const now = new Date().toISOString();

		try {
			const existing = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [id]);
			if (!existing) {
				return res.status(404).json({ error: "Task not found" });
			}

			// Save to history before updating
			await dbRun(
				`INSERT INTO task_history (task_id, title, description, content, is_completed, assigned_to, priority, due_date, tags, changed_by, changed_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[id, existing.title, existing.description, existing.content, existing.is_completed, existing.assigned_to, existing.priority, existing.due_date, existing.tags, currentUser || 'admin', now]
			);

			let completed_at = existing.completed_at;
			let completed_by = existing.completed_by;
			if (is_completed !== undefined) {
				if (is_completed && !existing.is_completed) {
					completed_at = now;
					completed_by = currentUser || "admin";
				} else if (!is_completed) {
					completed_at = null;
					completed_by = null;
				}
			}

			await dbRun(
				`UPDATE system_tasks SET 
					title = COALESCE(?, title),
					description = COALESCE(?, description),
					content = COALESCE(?, content),
					is_completed = COALESCE(?, is_completed),
					assigned_to = COALESCE(?, assigned_to),
					priority = COALESCE(?, priority),
					due_date = COALESCE(?, due_date),
					tags = COALESCE(?, tags),
					completed_at = ?,
					completed_by = ?,
					updated_at = ?
				 WHERE id = ?`,
				[
					title !== undefined ? title : null,
					description !== undefined ? description : null,
					content !== undefined ? content : null,
					is_completed !== undefined ? (is_completed ? 1 : 0) : null,
					assigned_to !== undefined ? assigned_to : null,
					priority !== undefined ? priority : null,
					due_date !== undefined ? due_date : null,
					tags !== undefined ? tags : null,
					completed_at,
					completed_by,
					now,
					id,
				]
			);

			const updated = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [id]);
			res.json(updated);
		} catch (err) {
			console.error("Error updating task:", err);
			res.status(500).json({ error: "Failed to update task" });
		}
	});

	// Delete a task
	app.delete("/api/tasks/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;

		try {
			// Delete checklist items
			await dbRun("DELETE FROM task_checklist WHERE task_id = ?", [id]);
			// Delete attachments
			await dbRun("DELETE FROM system_attachments WHERE task_id = ?", [id]);
			// Delete history
			await dbRun("DELETE FROM task_history WHERE task_id = ?", [id]);
			// Delete task
			await dbRun("DELETE FROM system_tasks WHERE id = ?", [id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting task:", err);
			res.status(500).json({ error: "Failed to delete task" });
		}
	});

	// Get task history
	app.get("/api/tasks/:id/history", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;

		try {
			const history = await dbAll(
				"SELECT * FROM task_history WHERE task_id = ? ORDER BY changed_at DESC",
				[id]
			);
			res.json(history);
		} catch (err) {
			console.error("Error fetching task history:", err);
			res.status(500).json({ error: "Failed to fetch history" });
		}
	});

	// Revert task to a previous version
	app.post("/api/tasks/:id/revert/:historyId", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id, historyId } = req.params;
		const now = new Date().toISOString();

		try {
			const historyRecord = await dbGet(
				"SELECT * FROM task_history WHERE id = ? AND task_id = ?",
				[historyId, id]
			);
			if (!historyRecord) {
				return res.status(404).json({ error: "History record not found" });
			}

			// Get current state and save to history first
			const current = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [id]);
			if (current) {
				await dbRun(
					`INSERT INTO task_history (task_id, title, description, content, is_completed, assigned_to, priority, due_date, tags, changed_by, changed_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[id, current.title, current.description, current.content, current.is_completed, current.assigned_to, current.priority, current.due_date, current.tags, currentUser || 'admin', now]
				);
			}

			// Revert to the history state
			await dbRun(
				`UPDATE system_tasks SET 
					title = ?, description = ?, content = ?, is_completed = ?, assigned_to = ?, priority = ?, due_date = ?, tags = ?, updated_at = ?
				 WHERE id = ?`,
				[historyRecord.title, historyRecord.description, historyRecord.content, historyRecord.is_completed, historyRecord.assigned_to, historyRecord.priority, historyRecord.due_date, historyRecord.tags, now, id]
			);

			const updated = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [id]);
			res.json(updated);
		} catch (err) {
			console.error("Error reverting task:", err);
			res.status(500).json({ error: "Failed to revert task" });
		}
	});

	// Upload attachments to task
	app.post("/api/tasks/:id/attachments", upload.array("files", 10), async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const now = new Date().toISOString();

		try {
			const task = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [id]);
			if (!task) {
				return res.status(404).json({ error: "Task not found" });
			}

			const attachments = [];
			for (const file of req.files || []) {
				const result = await dbRun(
					`INSERT INTO system_attachments (task_id, system_id, filename, original_name, mime_type, size, uploaded_by, uploaded_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[id, task.system_id, file.filename, file.originalname, file.mimetype, file.size, currentUser || "admin", now]
				);
				attachments.push({
					id: result.lastID,
					filename: file.filename,
					original_name: file.originalname,
					mime_type: file.mimetype
				});
			}

			res.json(attachments);
		} catch (err) {
			console.error("Error uploading attachments:", err);
			res.status(500).json({ error: "Failed to upload attachments" });
		}
	});

	// Reorder tasks within a system
	app.post("/api/systems/:id/tasks/reorder", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const { taskIds } = req.body;

		if (!Array.isArray(taskIds)) {
			return res.status(400).json({ error: "taskIds must be an array" });
		}

		try {
			// Update position for each task
			for (let i = 0; i < taskIds.length; i++) {
				await dbRun(
					"UPDATE system_tasks SET position = ? WHERE id = ? AND system_id = ?",
					[i, taskIds[i], id]
				);
			}

			res.json({ success: true });
		} catch (err) {
			console.error("Error reordering tasks:", err);
			res.status(500).json({ error: "Failed to reorder tasks" });
		}
	});

	// ==================== CHECKLIST API ====================

	// Add checklist item
	app.post("/api/tasks/:taskId/checklist", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { taskId } = req.params;
		const { title } = req.body;

		if (!title || !title.trim()) {
			return res.status(400).json({ error: "Title is required" });
		}

		try {
			const task = await dbGet("SELECT * FROM system_tasks WHERE id = ?", [taskId]);
			if (!task) {
				return res.status(404).json({ error: "Task not found" });
			}

			const maxPos = await dbGet(
				"SELECT MAX(position) as maxPos FROM task_checklist WHERE task_id = ?",
				[taskId]
			);
			const position = (maxPos?.maxPos || 0) + 1;

			const result = await dbRun(
				`INSERT INTO task_checklist (task_id, title, position) VALUES (?, ?, ?)`,
				[taskId, title.trim(), position]
			);

			const item = await dbGet("SELECT * FROM task_checklist WHERE id = ?", [result.lastID]);
			res.json(item);
		} catch (err) {
			console.error("Error adding checklist item:", err);
			res.status(500).json({ error: "Failed to add checklist item" });
		}
	});

	// Update checklist item
	app.put("/api/checklist/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;
		const { title, is_completed } = req.body;

		try {
			const existing = await dbGet("SELECT * FROM task_checklist WHERE id = ?", [id]);
			if (!existing) {
				return res.status(404).json({ error: "Checklist item not found" });
			}

			let completed_at = existing.completed_at;
			let completed_by = existing.completed_by;
			if (is_completed !== undefined) {
				if (is_completed && !existing.is_completed) {
					completed_at = new Date().toISOString();
					completed_by = currentUser || "admin";
				} else if (!is_completed) {
					completed_at = null;
					completed_by = null;
				}
			}

			await dbRun(
				`UPDATE task_checklist SET 
					title = COALESCE(?, title),
					is_completed = COALESCE(?, is_completed),
					completed_at = ?,
					completed_by = ?
				 WHERE id = ?`,
				[
					title !== undefined ? title : null,
					is_completed !== undefined ? (is_completed ? 1 : 0) : null,
					completed_at,
					completed_by,
					id,
				]
			);

			const updated = await dbGet("SELECT * FROM task_checklist WHERE id = ?", [id]);
			res.json(updated);
		} catch (err) {
			console.error("Error updating checklist item:", err);
			res.status(500).json({ error: "Failed to update checklist item" });
		}
	});

	// Delete checklist item
	app.delete("/api/checklist/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;

		try {
			await dbRun("DELETE FROM task_checklist WHERE id = ?", [id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting checklist item:", err);
			res.status(500).json({ error: "Failed to delete checklist item" });
		}
	});

	// ==================== ATTACHMENTS API ====================

	// Delete attachment
	app.delete("/api/attachments/:id", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const { id } = req.params;

		try {
			const attachment = await dbGet("SELECT * FROM system_attachments WHERE id = ?", [id]);
			if (!attachment) {
				return res.status(404).json({ error: "Attachment not found" });
			}

			// Try to delete the file
			if (uploadDir && attachment.filename) {
				const filePath = path.join(uploadDir, attachment.filename);
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
			}

			await dbRun("DELETE FROM system_attachments WHERE id = ?", [id]);
			res.json({ success: true });
		} catch (err) {
			console.error("Error deleting attachment:", err);
			res.status(500).json({ error: "Failed to delete attachment" });
		}
	});

	// ==================== GLOBAL HISTORY ====================

	// Get global edit history (combined systems and tasks)
	app.get("/api/history", async (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			return res.status(403).json({ error: "Not logged in" });
		}

		const limit = parseInt(req.query.limit) || 50;
		const offset = parseInt(req.query.offset) || 0;

		try {
			// Get system history
			const systemHistory = await dbAll(
				`SELECT sh.*, s.name as current_name, 'system' as type 
				 FROM system_history sh 
				 LEFT JOIN systems s ON sh.system_id = s.id 
				 ORDER BY sh.changed_at DESC LIMIT ? OFFSET ?`,
				[limit, offset]
			);

			// Get task history
			const taskHistory = await dbAll(
				`SELECT th.*, t.title as current_title, t.system_id, s.name as system_name, 'task' as type 
				 FROM task_history th 
				 LEFT JOIN system_tasks t ON th.task_id = t.id 
				 LEFT JOIN systems s ON t.system_id = s.id 
				 ORDER BY th.changed_at DESC LIMIT ? OFFSET ?`,
				[limit, offset]
			);

			// Combine and sort
			const combined = [...systemHistory.map(h => ({ ...h, type: 'system' })), ...taskHistory.map(h => ({ ...h, type: 'task' }))]
				.sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
				.slice(0, limit);

			res.json(combined);
		} catch (err) {
			console.error("Error fetching global history:", err);
			res.status(500).json({ error: "Failed to fetch history" });
		}
	});
};
