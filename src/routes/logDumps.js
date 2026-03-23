const crypto = require("crypto");

module.exports = function registerLogDumpRoutes(app, deps) {
	const { db, views, escapeHtml, isAdmin, getCurrentUser } = deps;

	// ── Public page: browse log dumps ──
	app.get("/log-dumps", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.redirect("/login");

		const categoryFilter = req.query.category || "";
		const search = req.query.search || "";
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const perPage = 50;
		const offset = (page - 1) * perPage;

		db.all("SELECT * FROM log_dump_categories ORDER BY name ASC", [], (err, categories) => {
			if (err) return res.status(500).send("Database error");
			categories = categories || [];

			let countSql = "SELECT COUNT(*) AS total FROM log_dumps d JOIN log_dump_categories c ON d.category_id = c.id WHERE 1=1";
			let dataSql = "SELECT d.*, c.name AS category_name FROM log_dumps d JOIN log_dump_categories c ON d.category_id = c.id WHERE 1=1";
			const params = [];

			if (categoryFilter) {
				countSql += " AND d.category_id = ?";
				dataSql += " AND d.category_id = ?";
				params.push(categoryFilter);
			}
			if (search) {
				countSql += " AND d.log_content LIKE ?";
				dataSql += " AND d.log_content LIKE ?";
				params.push("%" + search + "%");
			}

			dataSql += " ORDER BY d.created_at DESC LIMIT ? OFFSET ?";

			db.get(countSql, params, (err2, countRow) => {
				if (err2) return res.status(500).send("Database error");
				const total = countRow ? countRow.total : 0;
				const totalPages = Math.max(1, Math.ceil(total / perPage));

				const dataParams = [...params, perPage, offset];
				db.all(dataSql, dataParams, (err3, dumps) => {
					if (err3) return res.status(500).send("Database error");
					dumps = dumps || [];

					// Attach metadata for the view
					dumps._search = search;
					if (dumps.length > 0) dumps[0]._total = total;

					// Build pagination HTML
					let paginationHtml = "";
					if (totalPages > 1) {
						const qs = (p) => {
							const u = new URLSearchParams();
							if (categoryFilter) u.set("category", categoryFilter);
							if (search) u.set("search", search);
							u.set("page", p);
							return "/log-dumps?" + u.toString();
						};
						paginationHtml = '<div class="pagination">';
						if (page > 1) paginationHtml += `<a href="${qs(page - 1)}">← Prev</a>`;
						for (let i = 1; i <= totalPages; i++) {
							if (i === page) {
								paginationHtml += `<span class="current">${i}</span>`;
							} else if (Math.abs(i - page) <= 2 || i === 1 || i === totalPages) {
								paginationHtml += `<a href="${qs(i)}">${i}</a>`;
							} else if (Math.abs(i - page) === 3) {
								paginationHtml += `<span>…</span>`;
							}
						}
						if (page < totalPages) paginationHtml += `<a href="${qs(page + 1)}">Next →</a>`;
						paginationHtml += "</div>";
					}
					dumps._paginationHtml = paginationHtml;

					res.send(views.logDumpsPage({
						categories,
						selectedCategory: categoryFilter,
						dumps,
						currentUser,
					}));
				});
			});
		});
	});

	// ── API: submit a log dump (authenticated via API key) ──
	app.post("/api/log-dumps", (req, res) => {
		const authHeader = req.headers.authorization || "";
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

		if (!token) {
			return res.status(401).json({ error: "Missing Authorization header. Use: Bearer YOUR_API_KEY" });
		}

		db.get("SELECT * FROM api_keys WHERE key = ? AND is_active = 1", [token], (err, apiKey) => {
			if (err) return res.status(500).json({ error: "Database error" });
			if (!apiKey) return res.status(403).json({ error: "Invalid or disabled API key" });

			// Accept both casings: Category/category, Log/log
			const category = req.body.Category || req.body.category;
			const logContent = req.body.Log || req.body.log;

			if (!category || typeof category !== "string" || !category.trim()) {
				return res.status(400).json({ error: "Category is required" });
			}
			if (!logContent || typeof logContent !== "string" || !logContent.trim()) {
				return res.status(400).json({ error: "Log is required" });
			}

			const catName = category.trim();
			const now = new Date().toISOString();

			// Update last_used_at on the key
			db.run("UPDATE api_keys SET last_used_at = ? WHERE id = ?", [now, apiKey.id]);

			// Upsert category
			db.get("SELECT id FROM log_dump_categories WHERE name = ?", [catName], (err2, catRow) => {
				if (err2) return res.status(500).json({ error: "Database error" });

				const insertDump = (categoryId) => {
					db.run(
						"INSERT INTO log_dumps (category_id, log_content, api_key_id, created_at) VALUES (?, ?, ?, ?)",
						[categoryId, logContent.trim(), apiKey.id, now],
						function (err3) {
							if (err3) return res.status(500).json({ error: "Failed to save log dump" });
							res.status(201).json({
								success: true,
								id: this.lastID,
								category: catName,
							});
						}
					);
				};

				if (catRow) {
					insertDump(catRow.id);
				} else {
					db.run(
						"INSERT INTO log_dump_categories (name, created_at) VALUES (?, ?)",
						[catName, now],
						function (err3) {
							if (err3) return res.status(500).json({ error: "Failed to create category" });
							insertDump(this.lastID);
						}
					);
				}
			});
		});
	});

	// ── Admin: API Keys management ──
	app.get("/admin/api-keys", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		const msg = req.query.msg ? { text: req.query.msg, type: req.query.type || "success" } : null;

		db.all("SELECT * FROM api_keys ORDER BY created_at DESC", [], (err, keys) => {
			if (err) return res.status(500).send("Database error");
			res.send(views.apiKeysPage({ keys: keys || [], msg }));
		});
	});

	app.post("/admin/api-keys", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		const label = (req.body.label || "").trim();
		const key = crypto.randomBytes(32).toString("hex");
		const now = new Date().toISOString();
		const createdBy = req.currentUser || "admin";

		db.run(
			"INSERT INTO api_keys (key, label, created_by, created_at, is_active) VALUES (?, ?, ?, ?, 1)",
			[key, label || null, createdBy, now],
			function (err) {
				if (err) {
					return res.redirect("/admin/api-keys?msg=" + encodeURIComponent("Failed to create key") + "&type=error");
				}
				res.redirect("/admin/api-keys?msg=" + encodeURIComponent("API key created: " + key) + "&type=success");
			}
		);
	});

	app.post("/admin/api-keys/:id/toggle", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");
		const id = req.params.id;

		db.get("SELECT is_active FROM api_keys WHERE id = ?", [id], (err, row) => {
			if (err || !row) return res.redirect("/admin/api-keys?msg=" + encodeURIComponent("Key not found") + "&type=error");
			const newVal = row.is_active ? 0 : 1;
			db.run("UPDATE api_keys SET is_active = ? WHERE id = ?", [newVal, id], (err2) => {
				if (err2) return res.redirect("/admin/api-keys?msg=" + encodeURIComponent("Failed to update") + "&type=error");
				res.redirect("/admin/api-keys?msg=" + encodeURIComponent(newVal ? "Key enabled" : "Key disabled") + "&type=success");
			});
		});
	});

	app.post("/admin/api-keys/:id/delete", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");
		const id = req.params.id;

		db.run("DELETE FROM api_keys WHERE id = ?", [id], (err) => {
			if (err) return res.redirect("/admin/api-keys?msg=" + encodeURIComponent("Failed to delete") + "&type=error");
			res.redirect("/admin/api-keys?msg=" + encodeURIComponent("API key deleted") + "&type=success");
		});
	});

	// ── Delete a single log dump ──
	app.post("/log-dumps/:id/delete", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.status(403).send("Forbidden");

		const id = req.params.id;
		db.run("DELETE FROM log_dumps WHERE id = ?", [id], (err) => {
			if (err) return res.status(500).send("Failed to delete log dump");
			const back = req.get("Referer") || "/log-dumps";
			res.redirect(back);
		});
	});

	// ── Delete an entire category (and all its logs) ──
	app.post("/log-dumps/category/:id/delete", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.status(403).send("Forbidden");

		const id = req.params.id;
		db.run("DELETE FROM log_dumps WHERE category_id = ?", [id], (err) => {
			if (err) return res.status(500).send("Failed to delete logs");
			db.run("DELETE FROM log_dump_categories WHERE id = ?", [id], (err2) => {
				if (err2) return res.status(500).send("Failed to delete category");
				res.redirect("/log-dumps");
			});
		});
	});

	// ── Download a single log dump as .txt ──
	app.get("/log-dumps/:id/download", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.status(403).send("Forbidden");

		const id = req.params.id;
		db.get(
			"SELECT d.*, c.name AS category_name FROM log_dumps d JOIN log_dump_categories c ON d.category_id = c.id WHERE d.id = ?",
			[id],
			(err, row) => {
				if (err || !row) return res.status(404).send("Log dump not found");
				const filename = `logdump-${row.category_name}-${row.id}.txt`;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
				res.send(`Category: ${row.category_name}\nDate: ${row.created_at}\nID: ${row.id}\n${'='.repeat(60)}\n\n${row.log_content}`);
			}
		);
	});

	// ── Download entire category as one .txt file ──
	app.get("/log-dumps/category/:id/download", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) return res.status(403).send("Forbidden");

		const id = req.params.id;
		db.get("SELECT name FROM log_dump_categories WHERE id = ?", [id], (err, cat) => {
			if (err || !cat) return res.status(404).send("Category not found");

			db.all(
				"SELECT * FROM log_dumps WHERE category_id = ? ORDER BY created_at DESC",
				[id],
				(err2, dumps) => {
					if (err2) return res.status(500).send("Database error");
					dumps = dumps || [];

					const separator = '\n' + '='.repeat(60) + '\n';
					const header = `Category: ${cat.name}\nTotal logs: ${dumps.length}\nExported: ${new Date().toISOString()}\n`;
					const body = dumps.map((d, i) =>
						`--- Log #${d.id} | ${d.created_at} ---\n${d.log_content}`
					).join('\n\n');

					const filename = `category-${cat.name}-${dumps.length}logs.txt`;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
					res.send(header + separator + body);
				}
			);
		});
	});
};
