module.exports = function registerUploaderRoutes(app, deps) {
	const { db, upload, views, escapeHtml, getCurrentUser, isAdmin } = deps;

	function requireUser(req, res) {
		const user = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!user && !admin) {
			res.redirect("/login");
			return null;
		}
		return { user, admin };
	}

	function nowIso() {
		return new Date().toISOString();
	}

	function canAccessLog(req, logRow) {
		if (!logRow) return false;
		if (isAdmin(req)) return true;
		const user = getCurrentUser(req);
		return !!user && logRow.username === user;
	}

	function canAccessUpload(req, uploadRow, logRow) {
		if (!uploadRow) return false;
		if (isAdmin(req)) return true;
		const user = getCurrentUser(req);
		if (!user) return false;
		return !!logRow && logRow.username === user;
	}

	app.get("/uploader", (req, res) => {
		const auth = requireUser(req, res);
		if (!auth) return;

		const currentUserEscaped = escapeHtml(auth.user || "admin");
		const thresholdBytes = Number(process.env.ASYNC_UPLOAD_THRESHOLD_BYTES) || 50 * 1024 * 1024;
		res.send(
			views.uploaderPage({
				currentUserEscaped,
				thresholdBytes,
			})
		);
	});

	// Create a pending upload row and attach it to a log.
	app.post("/uploader/init", upload.none(), (req, res) => {
		const auth = requireUser(req, res);
		if (!auth) return;

		const logId = Number(req.body && req.body.logId);
		const bytesTotal = Number(req.body && req.body.bytesTotal) || 0;
		const originalName = String((req.body && req.body.originalName) || "");
		const mimeType = String((req.body && req.body.mimeType) || "");

		if (!logId) return res.status(400).json({ error: "Missing logId" });

		db.get("SELECT id, username FROM logs WHERE id = ?", [logId], (err, logRow) => {
			if (err || !logRow) return res.status(404).json({ error: "Log not found" });
			if (!canAccessLog(req, logRow)) return res.status(403).json({ error: "Forbidden" });

			const createdAt = nowIso();
			const updatedAt = createdAt;
			db.run(
				"INSERT INTO media_uploads (log_id, status, original_name, stored_name, mime_type, bytes_total, bytes_loaded, error, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, ?, NULL, ?, ?)",
				[
					logId,
					"pending",
					originalName,
					mimeType,
					bytesTotal,
					0,
					createdAt,
					updatedAt,
				],
				function () {
					const uploadId = this && this.lastID;
					if (!uploadId) return res.status(500).json({ error: "Failed to create upload" });

						db.run(
						"UPDATE logs SET media_upload_id = ?, media_path = NULL, media_type = NULL WHERE id = ?",
						[uploadId, logId],
						(updateErr) => {
							if (updateErr) {
								console.error("Failed to attach media_upload_id to log:", updateErr);
								return res.status(500).json({ error: "Failed to attach upload to log" });
							}
							res.json({ uploadId, logId });
						}
					);
				}
			);
		});
	});

	// Update progress (called from uploader page during XHR upload).
	app.post("/uploader/:uploadId/progress", upload.none(), (req, res) => {
		const auth = requireUser(req, res);
		if (!auth) return;

		const uploadId = Number(req.params.uploadId);
		const loaded = Math.max(0, Number(req.body && req.body.loaded) || 0);
		const total = Math.max(0, Number(req.body && req.body.total) || 0);
		if (!uploadId) return res.status(400).json({ error: "Bad uploadId" });

		db.get("SELECT * FROM media_uploads WHERE id = ?", [uploadId], (err, uploadRow) => {
			if (err || !uploadRow) return res.status(404).json({ error: "Upload not found" });
			db.get(
				"SELECT id, username FROM logs WHERE id = ?",
				[uploadRow.log_id],
				(logErr, logRow) => {
					if (logErr || !logRow) return res.status(404).json({ error: "Log not found" });
					if (!canAccessUpload(req, uploadRow, logRow)) return res.status(403).json({ error: "Forbidden" });

					const updatedAt = nowIso();
					db.run(
						"UPDATE media_uploads SET status = ?, bytes_loaded = ?, bytes_total = ?, updated_at = ? WHERE id = ?",
						["uploading", loaded, total || uploadRow.bytes_total || 0, updatedAt, uploadId],
						() => res.json({ ok: true })
					);
				}
			);
		});
	});

	// Upload endpoint: receives the file, writes it to disk via multer, then marks complete and attaches to log.
	app.post("/uploader/:uploadId", upload.single("media"), (req, res) => {
		const auth = requireUser(req, res);
		if (!auth) return;

		const uploadId = Number(req.params.uploadId);
		if (!uploadId) return res.status(400).json({ error: "Bad uploadId" });
		if (!req.file) return res.status(400).json({ error: "No file" });

		db.get("SELECT * FROM media_uploads WHERE id = ?", [uploadId], (err, uploadRow) => {
			if (err || !uploadRow) return res.status(404).json({ error: "Upload not found" });

			db.get(
				"SELECT id, username FROM logs WHERE id = ?",
				[uploadRow.log_id],
				(logErr, logRow) => {
					if (logErr || !logRow) return res.status(404).json({ error: "Log not found" });
					if (!canAccessUpload(req, uploadRow, logRow)) return res.status(403).json({ error: "Forbidden" });

					const storedName = req.file.filename;
					const mimeType = String(req.file.mimetype || uploadRow.mime_type || "");
					const mediaPath = "/uploads/" + storedName;
					const mediaType = mimeType.startsWith("video/") ? "video" : "image";
					const updatedAt = nowIso();

						db.run(
						"UPDATE media_uploads SET status = ?, stored_name = ?, mime_type = ?, bytes_loaded = ?, bytes_total = ?, error = NULL, updated_at = ? WHERE id = ?",
						[
							"complete",
							storedName,
							mimeType,
							Number(req.file.size) || uploadRow.bytes_loaded || 0,
							Number(req.file.size) || uploadRow.bytes_total || 0,
							updatedAt,
							uploadId,
						],
							(updateUploadErr) => {
								if (updateUploadErr) {
									console.error("Failed to mark media_uploads complete:", updateUploadErr);
									return res.status(500).json({ error: "Failed to update upload record" });
								}
								db.run(
									"UPDATE logs SET media_path = ?, media_type = ?, media_upload_id = NULL WHERE id = ?",
									[mediaPath, mediaType, uploadRow.log_id],
									(updateLogErr) => {
										if (updateLogErr) {
											console.error("Failed to attach media to log:", updateLogErr);
											return res.status(500).json({ error: "Failed to attach media to log" });
										}
										res.json({ ok: true, mediaPath, mediaType, logId: uploadRow.log_id });
									}
								);
							}
					);
				}
			);
		});
	});

	// Poll status for one or more upload IDs.
	app.get("/uploader/status", (req, res) => {
		const auth = requireUser(req, res);
		if (!auth) return;

		const idsRaw = String(req.query.ids || "");
		const ids = idsRaw
			.split(",")
			.map((s) => Number(s.trim()))
			.filter((n) => Number.isFinite(n) && n > 0)
			.slice(0, 50);

		if (ids.length === 0) return res.json({ uploads: {} });

		const placeholders = ids.map(() => "?").join(",");
		db.all(
			`SELECT * FROM media_uploads WHERE id IN (${placeholders})`,
			ids,
			(err, rows) => {
				if (err) return res.status(500).json({ error: "db error" });
				const byId = {};
				const list = rows || [];
				if (list.length === 0) return res.json({ uploads: {} });

				let pending = list.length;
				list.forEach((u) => {
					db.get("SELECT id, username FROM logs WHERE id = ?", [u.log_id], (logErr, logRow) => {
						pending--;
						if (!logErr && logRow && canAccessUpload(req, u, logRow)) {
							byId[u.id] = {
								id: u.id,
								logId: u.log_id,
								status: u.status,
								bytesLoaded: Number(u.bytes_loaded) || 0,
								bytesTotal: Number(u.bytes_total) || 0,
								error: u.error || null,
							};
						}
						if (pending <= 0) res.json({ uploads: byId });
					});
				});
			}
		);
	});
};
