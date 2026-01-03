module.exports = function registerPinnedRoutes(app, deps) {
	const { db, marked, views, getCurrentUser, isAdmin, escapeHtml, upload } = deps;

	// ---------- Create new pinned note (admin only) ----------
	app.post("/pinned/new", upload.single("media"), (req, res) => {
		if (!isAdmin(req)) {
			return res
				.status(403)
				.send("Forbidden – only admin can create pinned notes.");
		}

		const currentUser = getCurrentUser(req) || "admin";
		let { content } = req.body;
		const createdAt = new Date().toISOString();

		// If a file was uploaded, append it to the content
		if (req.file) {
			const mediaPath = "/uploads/" + req.file.filename;
			const mime = String(req.file.mimetype || "").toLowerCase();
			let embed = "";
			if (mime.startsWith("video/")) {
				embed = `\n\n<video controls style="max-width:100%; width:100%;" preload="none"><source src="${mediaPath}" /></video>`;
			} else {
				embed = `\n\n<img src="${mediaPath}" style="max-width:100%; width:100%;" />`;
			}
			content = (content || "") + embed;
		}

		db.serialize(() => {
			// Unpin any existing note
			db.run("UPDATE pinned_notes SET is_pinned = 0 WHERE is_pinned = 1");
			// Insert the new pinned note
			db.run(
				"INSERT INTO pinned_notes (content, created_at, username, is_pinned) VALUES (?, ?, ?, 1)",
				[content || "", createdAt, currentUser],
				(err) => {
					if (err) {
						console.error("Error inserting pinned note:", err);
					}
					res.redirect("/");
				}
			);
		});
	});

	// ---------- New Pinned Note (admin only) ----------
	app.get("/pinned/new", (req, res) => {
		const admin = isAdmin(req);
		if (!admin) {
			return res
				.status(403)
				.send("Forbidden – only admin can create pinned notes.");
		}

		const currentUser = getCurrentUser(req); // usually "admin" here

		const currentUserEscaped = escapeHtml(currentUser || "admin");
		res.send(views.pinnedNewPage({ currentUserEscaped }));
	});

	// ---------- Pinned note history + repin ----------
	app.get("/pinned/history", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			res.redirect("/login");
			return;
		}

		const PAGE_SIZE = 50;
		const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);

		db.get(
			"SELECT COUNT(*) AS totalCount FROM pinned_notes",
			[],
			(countErr, countRow) => {
				if (countErr) {
					return res.status(500).send("Error loading pinned notes");
				}

				const totalCount = (countRow && countRow.totalCount) || 0;
				const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
				const page = Math.min(requestedPage, totalPages);
				const offset = (page - 1) * PAGE_SIZE;

				db.all(
					"SELECT * FROM pinned_notes ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
					[PAGE_SIZE, offset],
					(err, rows) => {
						if (err) {
							return res.status(500).send("Error loading pinned notes");
						}

						const itemsHtml =
							rows.length === 0
								? '<p class="sub">No pinned notes have been created yet.</p>'
								: rows
										.map((n) => {
									const isPinned = !!n.is_pinned;
									const safeUser = n.username ? escapeHtml(n.username) : "";
									let safeDate = "";
									if (n.created_at) {
										try {
											safeDate = escapeHtml(
												new Date(n.created_at).toLocaleString()
											);
										} catch {
											safeDate = escapeHtml(n.created_at);
										}
									}
									const snippet = escapeHtml(
										(n.content || "").slice(0, 200) +
											((n.content || "").length > 200 ? "…" : "")
									);

									return `
									<div class="item">
										<div class="item-header">
											<div class="item-title">
												<span class="badge">Pinned Note #${n.id}</span>
												${
													isPinned
														? '<span class="badge badge-current">Currently Pinned</span>'
														: ""
												}
											</div>
											<div class="meta">
												${safeUser ? "@" + safeUser : ""}${
										safeUser && safeDate ? " · " : ""
									}${safeDate}
											</div>
										</div>
										<div class="snippet">${snippet}</div>
										<div class="actions">
											<a href="/pinned/${n.id}" class="btn btn-secondary">Open</a>
											${
												admin && !isPinned
													? `<form method="POST" action="/pinned/${n.id}/repin" style="margin:0;">
																<button type="submit" class="btn">Repin this note</button>
														</form>`
													: ""
											}
										 ${
											 admin
												 ? `<form method="POST" action="/pinned/${n.id}/delete" style="margin:0;">
															 <button type="submit" class="btn btn-secondary" onclick="return confirm('Delete this pinned note?');">
																 Delete
															 </button>
														 </form>`
												 : ""
										 }

										</div>
									</div>
								`;
								})
								.join("");

						let paginationHtml = "";
						if (totalPages > 1) {
							const prevHref = page > 1 ? `/pinned/history?page=${page - 1}` : "#";
							const nextHref = page < totalPages ? `/pinned/history?page=${page + 1}` : "#";
							paginationHtml = `
								<div class="pagination">
									<a class="btn btn-secondary${page <= 1 ? " disabled" : ""}" href="${prevHref}">Prev</a>
									<span class="page-meta">Page ${page} / ${totalPages}</span>
									<a class="btn btn-secondary${page >= totalPages ? " disabled" : ""}" href="${nextHref}">Next</a>
								</div>
							`;
						}

						res.send(
							views.pinnedHistoryPage({
								itemsHtml,
								paginationHtml,
								page,
								totalPages,
							})
						);
					}
				);
			}
		);
	});

	// ---------- Pinned history infinite-scroll page loader (JSON) ----------
	app.get("/pinned/history/page", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			res.status(401).json({ error: "login_required" });
			return;
		}

		const PAGE_SIZE = 50;
		const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);

		db.get("SELECT COUNT(*) AS totalCount FROM pinned_notes", [], (countErr, countRow) => {
			if (countErr) {
				console.error("/pinned/history/page count failed:", countErr);
				res.status(500).json({ error: "db_error" });
				return;
			}

			const totalCount = (countRow && countRow.totalCount) || 0;
			const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
			const page = Math.min(requestedPage, totalPages);
			const offset = (page - 1) * PAGE_SIZE;

			db.all(
				"SELECT * FROM pinned_notes ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
				[PAGE_SIZE, offset],
				(err, rows) => {
					if (err) {
						console.error("/pinned/history/page rows failed:", err);
						res.status(500).json({ error: "db_error" });
						return;
					}

					const itemsHtml =
						!rows || rows.length === 0
							? ""
							: rows
									.map((n) => {
										const isPinned = !!n.is_pinned;
										const safeUser = n.username ? escapeHtml(n.username) : "";
										let safeDate = "";
										if (n.created_at) {
											try {
												safeDate = escapeHtml(
													new Date(n.created_at).toLocaleString()
											);
											} catch {
												safeDate = escapeHtml(n.created_at);
											}
										}
										const snippet = escapeHtml(
											(n.content || "").slice(0, 200) +
												((n.content || "").length > 200 ? "…" : "")
										);

										return `
										<div class="item">
											<div class="item-header">
												<div class="item-title">
													<span class="badge">Pinned Note #${n.id}</span>
													${
														isPinned
															? '<span class="badge badge-current">Currently Pinned</span>'
															: ""
													}
												</div>
												<div class="meta">
													${safeUser ? "@" + safeUser : ""}${
													safeUser && safeDate ? " · " : ""
												}${safeDate}
												</div>
											</div>
											<div class="snippet">${snippet}</div>
											<div class="actions">
												<a href="/pinned/${n.id}" class="btn btn-secondary">Open</a>
												${
													admin && !isPinned
														? `<form method="POST" action="/pinned/${n.id}/repin" style="margin:0;">
																<button type="submit" class="btn">Repin this note</button>
															</form>`
														: ""
												}
												${
													admin
														? `<form method="POST" action="/pinned/${n.id}/delete" style="margin:0;">
																<button type="submit" class="btn btn-secondary" onclick="return confirm('Delete this pinned note?');">Delete</button>
														</form>`
														: ""
												}
											</div>
										</div>
									`;
									})
									.join("");

					res.json({ itemsHtml, page, totalPages });
				}
			);
		});
	});

	// ---------- Repin a note (admin only) ----------
	app.post("/pinned/:id/repin", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden – only admin can repin.");
		}

		const id = req.params.id;
		db.serialize(() => {
			db.run("UPDATE pinned_notes SET is_pinned = 0 WHERE is_pinned = 1");
			db.run(
				"UPDATE pinned_notes SET is_pinned = 1 WHERE id = ?",
				[id],
				(err) => {
					if (err) {
						console.error("Error repinning note:", err);
					}
					res.redirect("/");
				}
			);
		});
	});

	// ---------- Delete a pinned note (admin only) ----------
	app.post("/pinned/:id/delete", (req, res) => {
		if (!isAdmin(req)) {
			return res
				.status(403)
				.send("Forbidden – only admin can delete pinned notes.");
		}

		const id = req.params.id;

		db.run("DELETE FROM pinned_notes WHERE id = ?", [id], (err) => {
			if (err) {
				console.error("Error deleting pinned note:", err);
				return res.status(500).send("Failed to delete pinned note");
			}
			// After delete, just go to history; homepage will naturally show no pin if none exists.
			res.redirect("/pinned/history");
		});
	});

	// ---------- Edit pinned note (admin only) ----------
	app.get("/pinned/:id/edit", (req, res) => {
		if (!isAdmin(req)) {
			return res
				.status(403)
				.send("Forbidden – only admin can edit pinned notes.");
		}

		const id = req.params.id;
		db.get("SELECT * FROM pinned_notes WHERE id = ?", [id], (err, note) => {
			if (err || !note) {
				return res.status(404).send("Pinned note not found");
			}

			const safeContent = escapeHtml(note.content || "");
			const safeUser = escapeHtml(note.username || "");
			const safeDate = note.created_at
				? escapeHtml(new Date(note.created_at).toLocaleString())
				: "";

			res.send(
				views.pinnedEditPage({
					noteId: note.id,
					safeUser,
					safeDate,
					safeContent,
				})
			);
		});
	});

	// ---------- Save edits to pinned note (admin only) ----------
	app.post("/pinned/:id/edit", (req, res) => {
		if (!isAdmin(req)) {
			return res
				.status(403)
				.send("Forbidden – only admin can edit pinned notes.");
		}

		const id = req.params.id;
		const { content } = req.body;

		db.run(
			"UPDATE pinned_notes SET content = ? WHERE id = ?",
			[content || "", id],
			(err) => {
				if (err) {
					console.error("Error updating pinned note:", err);
					return res.status(500).send("Failed to update pinned note");
				}
				res.redirect(`/pinned/${id}`);
			}
		);
	});

	// ---------- View a single pinned note ----------
	app.get("/pinned/:id", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			res.redirect("/login");
			return;
		}

		const id = req.params.id;
		db.get("SELECT * FROM pinned_notes WHERE id = ?", [id], (err, note) => {
			if (err || !note) {
				return res.status(404).send("Pinned note not found");
			}

			const safeUser = note.username ? escapeHtml(note.username) : "";
			let safeDate = "";
			if (note.created_at) {
				try {
					safeDate = escapeHtml(new Date(note.created_at).toLocaleString());
				} catch {
					safeDate = escapeHtml(note.created_at);
				}
			}
			const bodyHtml = marked.parse(note.content || "");
			const isPinned = !!note.is_pinned;

			res.send(
				views.pinnedDetailPage({
					noteId: note.id,
					isPinned,
					safeUser,
					safeDate,
					bodyHtml,
					admin,
				})
			);
		});
	});
};
