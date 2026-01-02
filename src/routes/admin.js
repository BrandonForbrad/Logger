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
};
