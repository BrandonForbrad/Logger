module.exports = function registerAdminRoutes(app, deps) {
	const {
		db,
		fs,
		path,
		backupsDir,
		uploadDir,
		DB_PATH,
		upload,
		views,
		isAdmin,
		escapeHtml,
		formatBytes,
		getDirectorySize,
		getDiskUsage,
		createBackup,
		restoreFromBackup,
		restartSelf,
	} = deps;

	// ---------- Admin: missed hours per day ----------
	app.get("/admin/missed", (req, res) => {
		if (!isAdmin(req)) {
			res.status(403).send("Forbidden");
			return;
		}

		const today = new Date().toISOString().split("T")[0];
		const date = req.query.date || today;

		const sql = `
		SELECT u.username,
					 COALESCE(SUM(l.hours), 0) AS total_hours
		FROM users u
		LEFT JOIN logs l
			ON l.username = u.username
		 AND l.date = ?
		GROUP BY u.username
		ORDER BY u.username
	`;

		db.all(sql, [date], (err, rows) => {
			if (err) {
				res.status(500).send("DB error");
				return;
			}

			const rowsHtml = rows
				.map((r) => {
					const missed = (Number(r.total_hours) || 0) <= 0;
					return `
					<tr class="${missed ? "missed" : ""}">
						<td>@${escapeHtml(r.username)}</td>
						<td>${(Number(r.total_hours) || 0).toFixed(2)}</td>
						<td>${missed ? "Yes" : ""}</td>
					</tr>
				`;
				})
				.join("");

			const missedList =
				rows
					.filter((r) => (Number(r.total_hours) || 0) <= 0)
					.map((r) => "@" + escapeHtml(r.username))
					.join(", ") || "None 🎉";

			res.send(
				views.adminMissedHoursPage({
					dateEscaped: escapeHtml(date),
					rowsHtml,
					missedList,
				})
			);
		});
	});

	// ---------- Admin: backups & restore ----------
	app.get("/admin/backups", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		let backupFiles = [];
		if (fs.existsSync(backupsDir)) {
			const names = fs.readdirSync(backupsDir);
			backupFiles = names
				.filter((n) => n.toLowerCase().endsWith(".zip"))
				.map((name) => {
					const full = path.join(backupsDir, name);
					const stat = fs.statSync(full);
					return {
						name,
						size: stat.size,
						mtime: stat.mtime,
					};
				})
				.sort((a, b) => b.mtime - a.mtime);
		}

		const backupsHtml =
			backupFiles
				.map((b) => {
					const sizeHuman = formatBytes(b.size);
					const dateStr = b.mtime.toISOString().replace("T", " ").split(".")[0];
					const encoded = encodeURIComponent(b.name);
					return `
					<tr>
						<td>${escapeHtml(b.name)}</td>
						<td>${escapeHtml(dateStr)}</td>
						<td>${sizeHuman}</td>
						<td style="white-space:nowrap;">
							<a href="/admin/backups/download/${encoded}">Download</a>
						</td>
						<td>
							<form method="POST" action="/admin/backups/restore/${encoded}" onsubmit="return confirm('Restore from this backup and restart the server?');">
								<button type="submit">Restore</button>
							</form>
						</td>
						<td>
							<form method="POST" action="/admin/backups/delete/${encoded}" onsubmit="return confirm('Delete this backup file? This cannot be undone.');">
								<button type="submit" style="background:#e11d48; border-radius:999px; border:none; color:white; padding:4px 10px; font-size:12px; cursor:pointer;">Delete</button>
							</form>
						</td>
					</tr>
				`;
				})
				.join("") || '<tr><td colspan="6">No backups yet.</td></tr>';

		const dbSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
		const uploadsSize = getDirectorySize(uploadDir);
		const backupsSize = backupFiles.reduce((sum, b) => sum + b.size, 0);
		const totalUsed = dbSize + uploadsSize + backupsSize;

		getDiskUsage((_, disk) => {
			const usedStr = formatBytes(totalUsed);
			const dbStr = formatBytes(dbSize);
			const uploadsStr = formatBytes(uploadsSize);
			const backupsStr = formatBytes(backupsSize);

			let diskHtml = "";
			if (disk && disk.totalBytes && disk.freeBytes >= 0) {
				const totalStr = formatBytes(disk.totalBytes);
				const freeStr = formatBytes(disk.freeBytes);
				const usedPercent = ((totalUsed / disk.totalBytes) * 100).toFixed(1);
				diskHtml = `
				<p class="sub">
					<strong>Logger data usage:</strong> ${usedStr} (${usedPercent}% of disk)<br>
					<strong>Disk total:</strong> ${totalStr}<br>
					<strong>Disk free:</strong> ${freeStr}
				</p>
			`;
			} else {
				diskHtml = `
				<p class="sub">
					<strong>Logger data usage:</strong> ${usedStr}<br>
					<span>Disk total/free: unknown (system command not available)</span>
				</p>
			`;
			}

			res.send(
				views.adminBackupsPage({
					diskHtml,
					dbStr,
					uploadsStr,
					backupsStr,
					backupsHtml,
				})
			);
		});
	});

	app.post("/admin/backups/create", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		createBackup((err) => {
			if (err) {
				console.error("Backup error:", err);
				return res.send(
					"Backup error: " +
						escapeHtml(String(err)) +
						' <a href="/admin/backups">Back</a>'
				);
			}
			res.redirect("/admin/backups");
		});
	});

	app.get("/admin/backups/download/:file", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}
		const name = path.basename(req.params.file);
		const full = path.join(backupsDir, name);
		if (!fs.existsSync(full)) {
			return res.status(404).send("Backup not found");
		}
		res.download(full);
	});

	app.post("/admin/backups/restore/:file", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		const name = path.basename(req.params.file);
		const full = path.join(backupsDir, name);
		if (!fs.existsSync(full)) {
			return res.status(404).send("Backup not found");
		}

		// Send response first, then perform restore and restart
		res.send(views.restoringBackupPage());

		setTimeout(() => {
			restoreFromBackup(full, (err) => {
				if (err) {
					console.error("Restore error:", err);
					process.exit(1);
				} else {
					restartSelf();
				}
			});
		}, 200);
	});

	app.post("/admin/backups/delete/:file", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		const name = path.basename(req.params.file); // prevent path traversal
		const full = path.join(backupsDir, name);

		if (!fs.existsSync(full)) {
			return res.status(404).send("Backup not found");
		}

		fs.unlink(full, (err) => {
			if (err) {
				console.error("Error deleting backup:", err);
				return res
					.status(500)
					.send(
						"Error deleting backup: " +
							escapeHtml(String(err)) +
							' <a href="/admin/backups">Back</a>'
					);
			}

			res.redirect("/admin/backups");
		});
	});

	app.post(
		"/admin/backups/restore-upload",
		upload.single("backupFile"),
		(req, res) => {
			if (!isAdmin(req)) {
				return res.status(403).send("Forbidden");
			}
			if (!req.file) {
				return res.send('No file uploaded. <a href="/admin/backups">Back</a>');
			}

			const full = req.file.path;

			res.send(views.restoringUploadedBackupPage());

			setTimeout(() => {
				restoreFromBackup(full, (err) => {
					if (err) {
						console.error("Restore error:", err);
						process.exit(1);
					} else {
						restartSelf();
					}
				});
			}, 200);
		}
	);

	// ---------- Admin: storage cleanup ----------
	app.get("/admin/storage", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		// Gather all files from different sources
		const systemFiles = [];
		const taskFiles = [];
		const chatFiles = [];
		const logMediaFiles = [];

		// 1. system_attachments (system-level and task-level)
		db.all(
			`SELECT sa.*, s.name as system_name, st.title as task_title, st.is_completed as task_completed,
			        COALESCE(sa.task_id, NULL) as tid
			 FROM system_attachments sa
			 LEFT JOIN systems s ON sa.system_id = s.id
			 LEFT JOIN system_tasks st ON sa.task_id = st.id
			 ORDER BY sa.uploaded_at DESC`,
			[],
			(err, attachRows) => {
				if (err) attachRows = [];
				(attachRows || []).forEach((r) => {
					const entry = {
						id: String(r.id),
						filename: r.filename,
						originalName: r.original_name || r.filename,
						size: r.size || 0,
						sizeFormatted: formatBytes(r.size || 0),
						uploadedAt: r.uploaded_at ? r.uploaded_at.split("T")[0] : "",
						uploadedBy: r.uploaded_by || "",
						category: r.task_id ? "task" : "system",
						contextLabel: r.task_id
							? (r.task_title || "Task #" + r.task_id) + " (" + (r.system_name || "System") + ")"
							: (r.system_name || "System #" + r.system_id),
						taskCompleted: r.task_id ? !!r.task_completed : false,
					};
					if (r.task_id) taskFiles.push(entry);
					else systemFiles.push(entry);
				});

				// 2. chat_messages with attachments
				db.all(
					`SELECT cm.id, cm.attachment_filename, cm.attachment_original_name, cm.attachment_size,
					        cm.attachment_mime_type, cm.sender, cm.created_at, cm.context_type, cm.context_id,
					        s.name as system_name, st.title as task_title
					 FROM chat_messages cm
					 LEFT JOIN systems s ON cm.context_type = 'system' AND cm.context_id = s.id
					 LEFT JOIN system_tasks st ON cm.context_type = 'task' AND cm.context_id = st.id
					 WHERE cm.attachment_filename IS NOT NULL AND cm.attachment_filename != '' AND cm.deleted = 0
					 ORDER BY cm.created_at DESC`,
					[],
					(err2, chatRows) => {
						if (err2) chatRows = [];
						(chatRows || []).forEach((r) => {
							chatFiles.push({
								id: String(r.id),
								filename: r.attachment_filename,
								originalName: r.attachment_original_name || r.attachment_filename,
								size: r.attachment_size || 0,
								sizeFormatted: formatBytes(r.attachment_size || 0),
								uploadedAt: r.created_at ? r.created_at.split("T")[0] : "",
								uploadedBy: r.sender || "",
								category: "chat",
								contextLabel: r.context_type === "system"
									? (r.system_name || "System #" + r.context_id)
									: (r.task_title || "Task #" + r.context_id),
								taskCompleted: false,
							});
						});

						// 3. Log media
						db.all(
							`SELECT l.id, l.media_path, l.media_type, l.username, l.date
							 FROM logs l
							 WHERE l.media_path IS NOT NULL AND l.media_path != '' AND l.deleted = 0`,
							[],
							(err3, logRows) => {
								if (err3) logRows = [];
								(logRows || []).forEach((r) => {
									const fname = (r.media_path || "").replace(/^\/uploads\//, "");
									if (!fname) return;
									let fsize = 0;
									try {
										const st = fs.statSync(path.join(uploadDir, fname));
										fsize = st.size;
									} catch (e) { /* file may not exist */ }
									logMediaFiles.push({
										id: String(r.id),
										filename: fname,
										originalName: fname,
										size: fsize,
										sizeFormatted: formatBytes(fsize),
										uploadedAt: r.date || "",
										uploadedBy: r.username || "",
										category: "log",
										contextLabel: "Log " + r.date,
										taskCompleted: false,
									});
								});

								// 4. Roadmap attachments
								const roadmapFiles = [];
								db.all(
									`SELECT ra.*, rm.title as milestone_title, r.title as roadmap_title
									 FROM roadmap_attachments ra
									 LEFT JOIN roadmap_milestones rm ON ra.milestone_id = rm.id
									 LEFT JOIN roadmaps r ON rm.roadmap_id = r.id
									 ORDER BY ra.uploaded_at DESC`,
									[],
									(err4, rmRows) => {
										if (err4) rmRows = [];
										(rmRows || []).forEach((r) => {
											roadmapFiles.push({
												id: String(r.id),
												filename: r.filename,
												originalName: r.original_name || r.filename,
												size: r.size || 0,
												sizeFormatted: formatBytes(r.size || 0),
												uploadedAt: r.uploaded_at ? r.uploaded_at.split("T")[0] : "",
												uploadedBy: r.uploaded_by || "",
												category: "roadmap",
												contextLabel: (r.milestone_title || "Milestone") + " (" + (r.roadmap_title || "Roadmap") + ")",
												taskCompleted: false,
											});
										});

										// 5. Orphan files (in uploads/ but not tracked in any table)
										const trackedFiles = new Set();
										systemFiles.forEach((f) => trackedFiles.add(f.filename));
										taskFiles.forEach((f) => trackedFiles.add(f.filename));
										chatFiles.forEach((f) => trackedFiles.add(f.filename));
										logMediaFiles.forEach((f) => trackedFiles.add(f.filename));
										roadmapFiles.forEach((f) => trackedFiles.add(f.filename));

										const orphanFiles = [];
										let diskFiles = [];
										try {
											diskFiles = fs.readdirSync(uploadDir).filter((n) => !n.startsWith("."));
										} catch (e) { /* */ }

										let totalSize = 0;
										diskFiles.forEach((fname) => {
											try {
												const st = fs.statSync(path.join(uploadDir, fname));
												totalSize += st.size;
												if (!trackedFiles.has(fname)) {
													orphanFiles.push({
														id: fname,
														filename: fname,
														originalName: fname,
														size: st.size,
														sizeFormatted: formatBytes(st.size),
														uploadedAt: st.mtime ? st.mtime.toISOString().split("T")[0] : "",
														uploadedBy: "",
														category: "orphan",
														contextLabel: "Not linked to any record",
														taskCompleted: false,
													});
												}
											} catch (e) { /* */ }
										});

										res.send(
											views.storageCleanupPage({
												totalUploadsSize: formatBytes(totalSize),
												totalUploadsCount: diskFiles.length,
												systemFiles,
												taskFiles,
												chatFiles,
												orphanFiles,
												logMediaFiles,
												roadmapFiles,
											})
										);
									}
								);
							}
						);
					}
				);
			}
		);
	});

	// Delete files
	app.post("/admin/storage/delete", (req, res) => {
		if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

		const files = req.body.files;
		if (!Array.isArray(files) || !files.length) {
			return res.status(400).json({ error: "No files specified" });
		}

		const deletedIds = [];
		let pending = files.length;
		let hadError = false;

		files.forEach((f) => {
			const id = String(f.id);
			const category = String(f.category);

			function removePhysicalFile(filename) {
				if (!filename) return;
				const filePath = path.join(uploadDir, path.basename(filename));
				try {
					if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
				} catch (e) {
					console.error("Failed to delete file:", filePath, e);
				}
			}

			function done() {
				deletedIds.push(id + ":" + category);
				pending--;
				if (pending <= 0) {
					res.json({ success: true, count: deletedIds.length, deletedIds });
				}
			}

			function fail(msg) {
				pending--;
				if (pending <= 0 && !hadError) {
					hadError = true;
					res.json({ success: true, count: deletedIds.length, deletedIds });
				}
			}

			if (category === "system" || category === "task") {
				db.get("SELECT * FROM system_attachments WHERE id = ?", [id], (err, row) => {
					if (err || !row) return fail("not found");
					removePhysicalFile(row.filename);
					db.run("DELETE FROM system_attachments WHERE id = ?", [id], () => done());
				});
			} else if (category === "chat") {
				db.get("SELECT * FROM chat_messages WHERE id = ?", [id], (err, row) => {
					if (err || !row) return fail("not found");
					removePhysicalFile(row.attachment_filename);
					db.run(
						"UPDATE chat_messages SET attachment_filename = NULL, attachment_original_name = NULL, attachment_mime_type = NULL, attachment_size = NULL WHERE id = ?",
						[id],
						() => done()
					);
				});
			} else if (category === "log") {
				db.get("SELECT * FROM logs WHERE id = ?", [id], (err, row) => {
					if (err || !row) return fail("not found");
					const fname = (row.media_path || "").replace(/^\/uploads\//, "");
					removePhysicalFile(fname);
					db.run("UPDATE logs SET media_path = NULL, media_type = NULL WHERE id = ?", [id], () => done());
				});
			} else if (category === "orphan") {
				// id is the filename itself
				removePhysicalFile(id);
				done();
			} else if (category === "roadmap") {
				db.get("SELECT * FROM roadmap_attachments WHERE id = ?", [id], (err, row) => {
					if (err || !row) return fail("not found");
					removePhysicalFile(row.filename);
					db.run("DELETE FROM roadmap_attachments WHERE id = ?", [id], () => done());
				});
			} else {
				fail("unknown category");
			}
		});
	});

	// Download selected files as ZIP
	app.post("/admin/storage/download-zip", (req, res) => {
		if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

		const files = req.body.files;
		if (!Array.isArray(files) || !files.length) {
			return res.status(400).json({ error: "No files specified" });
		}

		// Collect filenames
		const filenames = [];
		let pending = files.length;

		function finishCollect() {
			if (pending > 0) return;

			const archiver = require("archiver");
			const archive = archiver("zip", { zlib: { level: 5 } });

			res.setHeader("Content-Type", "application/zip");
			res.setHeader("Content-Disposition", 'attachment; filename="storage-export.zip"');

			archive.on("error", (err) => {
				console.error("Archive error:", err);
				if (!res.headersSent) res.status(500).end();
			});

			archive.pipe(res);

			const seen = new Set();
			filenames.forEach((f) => {
				const filePath = path.join(uploadDir, path.basename(f.filename));
				if (fs.existsSync(filePath) && !seen.has(f.filename)) {
					seen.add(f.filename);
					archive.file(filePath, { name: f.originalName || f.filename });
				}
			});

			archive.finalize();
		}

		files.forEach((f) => {
			const id = String(f.id);
			const category = String(f.category);

			if (category === "system" || category === "task") {
				db.get("SELECT filename, original_name FROM system_attachments WHERE id = ?", [id], (err, row) => {
					if (row) filenames.push({ filename: row.filename, originalName: row.original_name });
					pending--;
					finishCollect();
				});
			} else if (category === "chat") {
				db.get("SELECT attachment_filename, attachment_original_name FROM chat_messages WHERE id = ?", [id], (err, row) => {
					if (row && row.attachment_filename) filenames.push({ filename: row.attachment_filename, originalName: row.attachment_original_name });
					pending--;
					finishCollect();
				});
			} else if (category === "log") {
				db.get("SELECT media_path FROM logs WHERE id = ?", [id], (err, row) => {
					if (row && row.media_path) {
						const fname = row.media_path.replace(/^\/uploads\//, "");
						filenames.push({ filename: fname, originalName: fname });
					}
					pending--;
					finishCollect();
				});
			} else if (category === "orphan") {
				filenames.push({ filename: id, originalName: id });
				pending--;
				finishCollect();
			} else if (category === "roadmap") {
				db.get("SELECT filename, original_name FROM roadmap_attachments WHERE id = ?", [id], (err, row) => {
					if (row) filenames.push({ filename: row.filename, originalName: row.original_name });
					pending--;
					finishCollect();
				});
			} else {
				pending--;
				finishCollect();
			}
		});
	});

	// ---------- Devlog Exporter ----------
	app.get("/admin/devlog-export", (req, res) => {
		if (!isAdmin(req)) return res.status(403).send("Forbidden");

		const selectedUser = req.query.user || "";
		const startDate = req.query.start || "";
		const endDate = req.query.end || "";
		const format = req.query.format || "";

		// Get all usernames
		db.all("SELECT username FROM users ORDER BY username", [], (err, userRows) => {
			if (err) userRows = [];
			const users = (userRows || []).map((r) => r.username);

			// If no date range, just show the form
			if (!startDate || !endDate) {
				return res.send(
					views.devlogExporterPage({
						users,
						selectedUser,
						startDate,
						endDate,
						rows: null,
						summary: null,
					})
				);
			}

			// Build every calendar day in the range
			const allDates = [];
			const s = new Date(startDate + "T00:00:00");
			const e = new Date(endDate + "T00:00:00");
			if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) {
				return res.send(
					views.devlogExporterPage({
						users,
						selectedUser,
						startDate,
						endDate,
						rows: null,
						summary: null,
					})
				);
			}
			for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
				allDates.push(d.toISOString().split("T")[0]);
			}

			// Query logs in the date range
			const params = [startDate, endDate];
			let userClause = "";
			if (selectedUser) {
				userClause = " AND l.username = ?";
				params.push(selectedUser);
			}

			db.all(
				`SELECT l.date, l.username, COALESCE(l.hours, 0) AS hours, l.content
				 FROM logs l
				 WHERE l.deleted = 0 AND l.date >= ? AND l.date <= ?${userClause}
				 ORDER BY l.date ASC, l.username ASC`,
				params,
				(err2, logRows) => {
					if (err2) logRows = [];

					// If exporting all users, we need to produce rows per user per day
					const targetUsers = selectedUser ? [selectedUser] : users;

					// Map: "date|username" -> { hours, previews }
					const logMap = {};
					(logRows || []).forEach((r) => {
						const key = r.date + "|" + r.username;
						if (!logMap[key]) logMap[key] = { hours: 0, previews: [] };
						logMap[key].hours += Number(r.hours) || 0;
						if (r.content) {
							const preview = r.content.replace(/[\r\n]+/g, " ").substring(0, 120);
							logMap[key].previews.push(preview);
						}
					});

					// Build rows
					const rows = [];
					targetUsers.forEach((user) => {
						allDates.forEach((date) => {
							const key = date + "|" + user;
							const entry = logMap[key];
							const hours = entry ? Math.round(entry.hours * 100) / 100 : 0;
							const logged = !!entry;
							rows.push({
								date,
								username: user,
								hours: hours.toFixed(2),
								status: logged ? "logged" : "missed",
								preview: entry ? entry.previews.join(" | ").substring(0, 150) : "",
							});
						});
					});

					// If CSV format requested, stream it
					if (format === "csv") {
						res.setHeader("Content-Type", "text/csv; charset=utf-8");
						const fname = selectedUser
							? "devlog-" + selectedUser + "-" + startDate + "-to-" + endDate + ".csv"
							: "devlog-all-users-" + startDate + "-to-" + endDate + ".csv";
						res.setHeader("Content-Disposition", 'attachment; filename="' + fname + '"');

						let csv = "Date,User,Hours,Status,Preview\n";
						rows.forEach((r) => {
							const preview = r.preview.replace(/"/g, '""');
							csv += r.date + "," + r.username + "," + r.hours + "," + r.status + ',"' + preview + '"\n';
						});
						return res.send(csv);
					}

					// Summary stats
					const daysLogged = rows.filter((r) => r.status === "logged").length;
					const daysMissed = rows.filter((r) => r.status === "missed").length;
					const totalHours = rows.reduce((sum, r) => sum + parseFloat(r.hours), 0);

					res.send(
						views.devlogExporterPage({
							users,
							selectedUser,
							startDate,
							endDate,
							rows,
							summary: {
								totalDays: rows.length,
								daysLogged,
								daysMissed,
								totalHours: totalHours.toFixed(2),
								avgHours: rows.length ? (totalHours / rows.length).toFixed(2) : "0.00",
							},
						})
					);
				}
			);
		});
	});
};
