function registerLogsReadRoutes(app, deps) {
	const {
		db,
		marked,
		views,
		escapeHtml,
		getCurrentUser,
		isAdmin,
		getRequireAdminSetup,
		getContactEmail,
		getContactDiscord,
	} = deps;

	// ---------- Edit form (admin only, GET) ----------
	app.get("/edit/:id", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		const id = req.params.id;
		db.get("SELECT * FROM logs WHERE id = ?", [id], (err, log) => {
			if (err || !log) {
				return res.status(404).send("Log not found");
			}

			const CONTACT_EMAIL = getContactEmail();
			const CONTACT_DISCORD = getContactDiscord();

			const safeUsername = escapeHtml(log.username || "");
			const safeDate = escapeHtml(log.date || "");
			const safeImageUrl = escapeHtml(log.image_url || "");
			const safeContent = escapeHtml(log.content || "");
			const hoursVal = Number(log.hours) || 0;

			res.send(
				views.editLogPage({
					logId: log.id,
					safeUsername,
					safeDate,
					safeImageUrl,
					safeContent,
					hoursVal,
					CONTACT_EMAIL,
					CONTACT_DISCORD,
				})
			);
		});
	});

	app.get("/logs/:id/history", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		const id = req.params.id;

		// Fetch current log + its history
		db.get("SELECT * FROM logs WHERE id = ?", [id], (err, log) => {
			if (err || !log) {
				return res.status(404).send("Log not found");
			}

			db.all(
				"SELECT * FROM log_history WHERE log_id = ? ORDER BY edited_at DESC, id DESC",
				[id],
				(histErr, historyRows) => {
					if (histErr) {
						return res.status(500).send("Error loading history");
					}

					const historyHtml =
						historyRows.length === 0
							? "<p class=\"sub\">No edits recorded for this log yet.</p>"
							: historyRows
									.map((h) => {
										const when = h.edited_at || "";
										const editor = h.editor_username || "unknown";
										const oldUser = h.old_username || "";
										const oldDate = h.old_date || "";
										const oldHours = h.old_hours != null ? h.old_hours : "";
										const safeContent = escapeHtml(h.old_content || "");

										return `
										<details style="border:1px solid #e5e7eb; border-radius:10px; padding:8px 10px; margin-bottom:8px; background:#f9fafb;">
											<summary style="cursor:pointer; font-size:13px;">
												<strong>Edited at:</strong> ${escapeHtml(
													when
												)} &mdash; <strong>Editor:</strong> ${escapeHtml(
											editor
										)}
												${
													oldUser
														? ` &mdash; <strong>User:</strong> @${escapeHtml(
																oldUser
															)}`
														: ""
												}
												${
													oldDate
														? ` &mdash; <strong>Date:</strong> ${escapeHtml(
																oldDate
															)}`
														: ""
												}
												${
													oldHours !== ""
														? ` &mdash; <strong>Hours:</strong> ${oldHours}`
														: ""
												}
											</summary>
											<div style="margin-top:6px; font-size:13px;">
												<pre style="white-space:pre-wrap; font-family:inherit; background:white; border-radius:6px; padding:6px; border:1px solid #e5e7eb; max-height:280px; overflow:auto;">${safeContent}</pre>
											</div>
										</details>
									`;
									})
									.join("");

					const safeCurrentUser = log.username ? escapeHtml(log.username) : "";
					const safeCurrentDate = log.date ? escapeHtml(log.date) : "";
					const safeCurrentContent = escapeHtml(log.content || "");

					res.send(
						views.logHistoryPage({
							logId: log.id,
							safeCurrentUser,
							safeCurrentDate,
							safeCurrentContent,
							hours: log.hours,
							historyHtml,
						})
					);
				}
			);
		});
	});

	// ---------- Homepage – list logs, grouped by date, filter by username ----------
	app.get("/", (req, res) => {
		// Force initial admin setup before anything else
		if (getRequireAdminSetup()) {
			res.redirect("/admin/setup");
			return;
		}

		const userFilter = req.query.user || "";
		const period = req.query.period || ""; // "", "day", "week", "month", "year"
		const dateRef = req.query.date || ""; // "YYYY-MM-DD" anchor date (optional)

		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);

		// Require login (user or admin) to see anything
		if (!currentUser && !admin) {
			res.redirect("/login");
			return;
		}

		const CONTACT_EMAIL = getContactEmail();
		const CONTACT_DISCORD = getContactDiscord();

		db.get(
			"SELECT * FROM pinned_notes WHERE is_pinned = 1 ORDER BY id DESC LIMIT 1",
			(pinErr, pinnedNote) => {
				if (pinErr) {
					console.error("Error loading pinned note:", pinErr);
				}

				const personalUsername = currentUser || null;
				const nowMs = Date.now();
				let swInitialSeconds = 0;
				let swInitialRunning = false;
				let personalNoteContent = "";

				function proceedWithLogs() {
					const dbAllAsync = (sql, params = []) =>
						new Promise((resolve, reject) => {
							db.all(sql, params, (err, rows) => {
								if (err) return reject(err);
								resolve(rows || []);
							});
						});
					const dbGetAsync = (sql, params = []) =>
						new Promise((resolve, reject) => {
							db.get(sql, params, (err, row) => {
								if (err) return reject(err);
								resolve(row || null);
							});
						});

					(async () => {
						// ----- Date range filtering (day / week / month / year) -----
						let rangeStart = null;
						let rangeEnd = null;

						if (period && dateRef) {
							const base = new Date(dateRef);
							if (!isNaN(base.getTime())) {
								const y = base.getFullYear();
								const m = base.getMonth();
								const d = base.getDate();

								if (period === "day") {
									const start = new Date(y, m, d);
									const end = new Date(y, m, d);
									rangeStart = start.toISOString().split("T")[0];
									rangeEnd = end.toISOString().split("T")[0];
								} else if (period === "week") {
									const dayOfWeek = base.getDay();
									const offsetToMonday = (dayOfWeek + 6) % 7;
									const start = new Date(base);
									start.setDate(base.getDate() - offsetToMonday);
									const end = new Date(start);
									end.setDate(start.getDate() + 6);
									rangeStart = start.toISOString().split("T")[0];
									rangeEnd = end.toISOString().split("T")[0];
								} else if (period === "month") {
									const start = new Date(y, m, 1);
									const end = new Date(y, m + 1, 0);
									rangeStart = start.toISOString().split("T")[0];
									rangeEnd = end.toISOString().split("T")[0];
								} else if (period === "year") {
									const start = new Date(y, 0, 1);
									const end = new Date(y, 11, 31);
									rangeStart = start.toISOString().split("T")[0];
									rangeEnd = end.toISOString().split("T")[0];
								}
							}
						}

						const PAGE_SIZE = 50;
						const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);

						// Dropdown totals are by DATE RANGE only (not user filter)
						const dropdownWhereParts = ["username IS NOT NULL"];
						const dropdownParams = [];
						if (rangeStart && rangeEnd) {
							dropdownWhereParts.push("date >= ? AND date <= ?");
							dropdownParams.push(rangeStart, rangeEnd);
						}
						const dropdownWhereSql = "WHERE " + dropdownWhereParts.join(" AND ");

						const ddRows = await dbAllAsync(
							`SELECT username, SUM(COALESCE(hours, 0)) AS totalHours
							 FROM logs
							 ${dropdownWhereSql}
							 GROUP BY username`,
							dropdownParams
						);

						const perUserTotalsForDropdown = {};
						ddRows.forEach((r) => {
							if (!r || !r.username) return;
							perUserTotalsForDropdown[r.username] = Number(r.totalHours) || 0;
						});
						const allUsernames = Object.keys(perUserTotalsForDropdown).sort((a, b) =>
							a.localeCompare(b)
						);

						// Filters for the actual list and totals (date range + user)
						const whereParts = [];
						const whereParams = [];
						if (rangeStart && rangeEnd) {
							whereParts.push("l.date >= ? AND l.date <= ?");
							whereParams.push(rangeStart, rangeEnd);
						}
						if (userFilter) {
							whereParts.push("l.username = ?");
							whereParams.push(userFilter);
						}
						const whereSql = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";

						const countRow = await dbGetAsync(
							`SELECT COUNT(*) AS totalCount, SUM(COALESCE(l.hours, 0)) AS totalHours
							 FROM logs l
							 ${whereSql}`,
							whereParams
						);

						const totalCount = (countRow && countRow.totalCount) || 0;
						const overallHoursFiltered = (countRow && Number(countRow.totalHours)) || 0;
						const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
						const page = Math.min(requestedPage, totalPages);
						const offset = (page - 1) * PAGE_SIZE;

						const perUserWhereParts = ["l.username IS NOT NULL"];
						const perUserWhereParams = [];
						if (rangeStart && rangeEnd) {
							perUserWhereParts.push("l.date >= ? AND l.date <= ?");
							perUserWhereParams.push(rangeStart, rangeEnd);
						}
						if (userFilter) {
							perUserWhereParts.push("l.username = ?");
							perUserWhereParams.push(userFilter);
						}
						const perUserWhereSql = "WHERE " + perUserWhereParts.join(" AND ");

						const totRows = await dbAllAsync(
							`SELECT l.username AS username, SUM(COALESCE(l.hours, 0)) AS totalHours
							 FROM logs l
							 ${perUserWhereSql}
							 GROUP BY l.username
							 ORDER BY l.username`,
							perUserWhereParams
						);

						const perUserTotalsFiltered = {};
						totRows.forEach((r) => {
							if (!r || !r.username) return;
							perUserTotalsFiltered[r.username] = Number(r.totalHours) || 0;
						});
						const filteredUsernames = Object.keys(perUserTotalsFiltered).sort((a, b) =>
							a.localeCompare(b)
						);

						const pageRows = await dbAllAsync(
							`SELECT l.*,
									EXISTS(SELECT 1 FROM log_history h WHERE h.log_id = l.id) AS has_history
							 FROM logs l
							 ${whereSql}
							 ORDER BY l.date DESC, l.id DESC
							 LIMIT ? OFFSET ?`,
							[...whereParams, PAGE_SIZE, offset]
						);

						// Group logs by date (only this page)
						const grouped = {};
						pageRows.forEach((log) => {
							const key = log.date || "No Date";
							if (!grouped[key]) grouped[key] = [];
							grouped[key].push(log);
						});
						const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

						const urlParams = new URLSearchParams();
						if (userFilter) urlParams.set("user", userFilter);
						if (period) urlParams.set("period", period);
						if (dateRef) urlParams.set("date", dateRef);
						const baseQs = urlParams.toString();
						function pageHref(p) {
							const qp = new URLSearchParams(baseQs);
							if (p > 1) qp.set("page", String(p));
							const qs = qp.toString();
							return "/" + (qs ? "?" + qs : "");
						}

						const paginationHtml =
							totalPages > 1
								? `
								<div class="pagination">
									<a class="page-link${page <= 1 ? " disabled" : ""}" href="${
										page <= 1 ? "#" : pageHref(page - 1)
									}">Prev</a>
									<span class="page-meta">Page ${page} / ${totalPages}</span>
									<a class="page-link${page >= totalPages ? " disabled" : ""}" href="${
										page >= totalPages ? "#" : pageHref(page + 1)
									}">Next</a>
								</div>
								`
								: "";

						const contentHtml = dates
							.map((date) => {
								const logs = grouped[date];

									const totalHours = logs.reduce(
										(sum, log) => sum + (Number(log.hours) || 0),
										0
									);
									const countEntries = logs.length;

									const logsHtml = logs
										.map((log) => {
											let mediaHtml = "";

											if (log.media_path) {
												const safePath = escapeHtml(log.media_path);
												if (log.media_type === "video") {
													mediaHtml = `
													<div class="media">
																			<video controls preload="metadata" class="media-element">
															<source src="${safePath}">
															Your browser does not support the video tag.
														</video>
													</div>
												`;
												} else {
													mediaHtml = `
													<div class="media">
																			<img src="${safePath}" loading="lazy" class="media-element" alt="Log media">
													</div>
												`;
												}
											} else if (log.image_url) {
												mediaHtml = `
												<div class="media">
																<img src="${escapeHtml(
														log.image_url
																)}" loading="lazy" class="media-element" alt="Log image">
												</div>
											`;
											}

											const adminActions = admin
												? `
												<div class="admin-actions">
													<a href="/edit/${log.id}" class="pill-button pill-button-ghost">Edit</a>
													<form method="POST" action="/delete/${log.id}" style="display:inline;" onsubmit="return confirm('Delete this log?');">
														<button type="submit" class="pill-button pill-button-danger">Delete</button>
													</form>
												</div>
											`
												: "";

											const usernameLabel = log.username
												? `<span class="username-badge">@${escapeHtml(log.username)}</span>`
												: `<span class="username-badge username-anon">[no user]</span>`;

											const editedBadge = log.has_history
												? '<span class="edited-badge">Edited</span>'
												: "";

											return `
											<article class="log-card">
												<header class="log-header">
													<div>
														${usernameLabel}
														${editedBadge}
														<div class="hours-row">
															<span class="hours-label">Hours</span>
															<span class="hours-value">${log.hours}</span>
														</div>
													</div>
													<div class="log-id">#${log.id}</div>
												</header>
												<div class="log-body">
													${marked.parse(log.content || "")}
													${mediaHtml}
												</div>
												${adminActions}
												<div class="log-footer">
													${
														log.has_history
															? `<a href="/logs/${log.id}/history" class="history-link">View edit history</a> · `
															: ""
													}
													<span class="dispute-hint">
														If you believe this log is incorrect, contact
														<code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code>.
													</span>
												</div>
											</article>
										`;
										})
										.join("");

								return `
								<section class="day-section" data-day="${escapeHtml(date)}">
									<div class="day-header">
										<h2 class="day-title">${escapeHtml(date)}</h2>
										<div class="day-meta">
											<span>${countEntries} entr${countEntries === 1 ? "y" : "ies"}</span>
											<span>${totalHours.toFixed(2)} total hours</span>
										</div>
									</div>
									<div class="day-logs">${logsHtml}</div>
								</section>
							`;
								})
								.join("");

							const filterFormHtml = `
							<form method="GET" action="/" class="filter-bar">
								<input type="hidden" name="page" value="1" />
								<label for="userFilter" class="filter-label">Filter:</label>

								<!-- User filter -->
								<select id="userFilter" name="user" class="filter-select" onchange="this.form.submit()">
									<option value="">All users</option>
									${allUsernames
										.map((u) => {
											const safe = escapeHtml(u);
											const selected = u === userFilter ? " selected" : "";
											const total = perUserTotalsForDropdown[u] || 0;
											return `<option value="${safe}"${selected}>${safe} (${total.toFixed(
												2
											)}h)</option>`;
										})
										.join("")}
								</select>

								<!-- Period filter -->
								<select name="period" class="filter-select" onchange="this.form.submit()">
									<option value="">All time</option>
									<option value="day"${period === "day" ? " selected" : ""}>Day</option>
									<option value="week"${period === "week" ? " selected" : ""}>Week</option>
									<option value="month"${period === "month" ? " selected" : ""}>Month</option>
									<option value="year"${period === "year" ? " selected" : ""}>Year</option>
								</select>
                
								<!-- Anchor date -->
								<input
									type="date"
									name="date"
									value="${escapeHtml(dateRef || "")}"
									class="filter-select"
									onchange="this.form.submit()"
								/>

								${
									userFilter || period || dateRef
										? `<a href="/" class="filter-clear">Clear</a>`
										: ""
								}

								${
									admin
										? `
											<a href="/pinned/new" class="pill-button pill-button-ghost">📌New Pinned</a>
										`
										: ""
								}
								 <a href="/pinned/history" class="pill-button pill-button-ghost">📌History</a>
							</form>
						`;

							let activeRangeSummary = "";
							if (rangeStart && rangeEnd) {
								activeRangeSummary = `<p class="sub" style="margin-bottom:8px;">Showing logs from <strong>${escapeHtml(
									rangeStart
								)}</strong> to <strong>${escapeHtml(rangeEnd)}</strong>.</p>`;
							}

							// ----- Pinned note HTML -----
							let pinnedNoteHtml = "";
							if (pinnedNote) {
								const safePinnedUser = pinnedNote.username
									? escapeHtml(pinnedNote.username)
									: "";
								let safePinnedDate = "";
								if (pinnedNote.created_at) {
									try {
										safePinnedDate = escapeHtml(
											new Date(pinnedNote.created_at).toLocaleString()
										);
									} catch {
										safePinnedDate = escapeHtml(pinnedNote.created_at);
									}
								}
								const pinnedBody = marked.parse(pinnedNote.content || "");
								pinnedNoteHtml = `
								<section class="pinned-note-card">
									<div class="pinned-note-header">
										<div>
											<div class="pinned-note-badge">Pinned Note</div>
											${
												safePinnedUser || safePinnedDate
													? `<div class="pinned-note-meta">
															 ${
																 safePinnedUser
																	 ? "@"+safePinnedUser
																	 : ""
															 }${
																 safePinnedUser && safePinnedDate ? " · " : ""
															 }${
																 safePinnedDate
															 }
														 </div>`
													: ""
											}
										</div>
										<button
											type="button"
											class="pill-button pill-button-ghost"
											id="copyPinnedLink"
											data-url="/pinned/${pinnedNote.id}"
										>
											Copy Link
										</button>
									</div>
									<div class="pinned-note-body">
										${pinnedBody}
									</div>
									<div class="pinned-note-actions">
										<a href="/pinned/${pinnedNote.id}" class="pill-button pill-button-ghost">Open note</a>
										${
											admin
												? `
													<a href="/pinned/${pinnedNote.id}/edit" class="pill-button pill-button-ghost">Edit</a>
													<form method="POST" action="/pinned/${pinnedNote.id}/delete" style="display:inline;">
														<button type="submit" class="pill-button pill-button-ghost" onclick="return confirm('Delete this pinned note?');">
															Delete
														</button>
													</form>
												`
												: ""
										}
									</div>
								</section>
							`;
							}

							// ----- Personal stopwatch + personal note (sidebar) -----
							const safePersonalNote = escapeHtml(personalNoteContent || "");

							const stopwatchSidebarHtml = personalUsername
								? `
								<div class="sidebar-heading" style="margin-top:10px;">Your Stopwatch</div>
								<div
									class="stopwatch-card"
									data-stopwatch
									data-initial-elapsed="${swInitialSeconds}"
									data-initial-running="${swInitialRunning ? "1" : "0"}"
								>
									<div class="stopwatch-time" id="stopwatchTime">00:00:00</div>
									<div class="stopwatch-buttons">
										<button type="button" class="pill-button pill-button-ghost" id="swStart">Start</button>
										<button type="button" class="pill-button pill-button-ghost" id="swPause">Pause</button>
										<button type="button" class="pill-button pill-button-ghost" id="swReset">Reset</button>
									</div>
									<div class="stopwatch-hint">
										Personal only – helps you track your work time. It does not change official logged hours.
									</div>
								</div>
							`
								: "";

							const personalNoteSidebarHtml = personalUsername
								? `
								<div class="sidebar-heading" style="margin-top:10px;">Your Personal Note</div>
								<form method="POST" action="/me/note" class="personal-note-form">
									<textarea
										name="content"
										class="personal-note-textarea"
										placeholder="Write a note for yourself..."
									>${safePersonalNote}</textarea>
									<button type="submit" class="pill-button pill-button-ghost personal-note-save">
										Save Note
									</button>
								</form>
								<div class="personal-note-hint">
									Only you (and admins) can see this note.
								</div>
							`
								: "";

							const html = `
<!DOCTYPE html>
<html>
<head>
	<title>Daily Logs</title>
	<style>
		.pinned-note-card {
			border-radius: 12px;
			border: 1px solid var(--border-strong);
			background: #ecfeff;
			padding: 12px 14px;
			margin-bottom: 14px;
		}
		.pinned-note-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 8px;
			margin-bottom: 6px;
		}
		.pinned-note-badge {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 2px 8px;
			border-radius: 999px;
			background: #0ea5e9;
			color: white;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.08em;
		}
		.pinned-note-meta {
			margin-top: 4px;
			font-size: 11px;
			color: var(--text-muted);
		}
		.pinned-note-body {
			font-size: 13px;
			margin-top: 4px;
		}
		.pinned-note-body p {
			margin: 4px 0;
		}
		.pinned-note-actions {
			margin-top: 8px;
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
		}

		.edited-badge {
			display:inline-flex;
			align-items:center;
			padding:2px 6px;
			margin-left:6px;
			border-radius:999px;
			background:#fef3c7;
			color:#92400e;
			font-size:10px;
			font-weight:600;
			text-transform:uppercase;
			letter-spacing:0.06em;
		}
		.log-footer {
			margin-top:6px;
			font-size:11px;
			color: var(--text-muted);
		}
		.history-link {
			font-size:11px;
		}
		.history-link:hover { text-decoration:underline; }
		.dispute-hint code {
			font-size:11px;
		}

		:root {
			--bg: #f3f4f6;
			--surface: #ffffff;
			--surface-alt: #f9fafb;
			--border: #e5e7eb;
			--border-strong: #d1d5db;
			--accent: #00a2ff;
			--accent-soft: #e0f2ff;
			--text-main: #111827;
			--text-muted: #6b7280;
			--danger: #e11d48;
			--shadow-soft: 0 10px 25px rgba(15, 23, 42, 0.08);
			--radius-lg: 16px;
			--radius-pill: 999px;
		}
		* { box-sizing: border-box; }
		body {
			margin: 0;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			background: radial-gradient(circle at top left, #e5f2ff 0, #f3f4f6 55%, #eef2ff 100%);
			color: var(--text-main);
		}
		a { color: var(--accent); text-decoration: none; }
		a:hover { text-decoration: underline; }

		.page-shell {
			min-height: 100vh;
			display: flex;
			justify-content: center;
			padding: 24px 12px;
		}
		.page-inner {
			width: 100%;
			max-width: 1100px;
		}

		header.site-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 12px;
			margin-bottom: 16px;
			flex-wrap: wrap;
		}
		.brand {
			display: flex;
			align-items: center;
			gap: 10px;
			min-width: 0;
		}
		.brand-logo {
			width: 32px;
			height: 32px;
			border-radius: 999px;
			background: linear-gradient(135deg, #00a2ff, #6366f1);
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			font-weight: 700;
			font-size: 18px;
			box-shadow: 0 8px 18px rgba(59, 130, 246, 0.45);
			flex-shrink: 0;
		}
		.brand-title {
			font-weight: 700;
			font-size: 20px;
		}
		.brand-subtitle {
			font-size: 12px;
			color: var(--text-muted);
		}

		.pill-button {
			border-radius: var(--radius-pill);
			border: 1px solid transparent;
			padding: 6px 14px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			background: var(--accent);
			color: white;
			display: inline-flex;
			align-items: center;
			gap: 6px;
			box-shadow: 0 3px 8px rgba(0, 162, 255, 0.4);
		}
		.pill-button-ghost {
			background: transparent;
			color: var(--text-main);
			border-color: var(--border-strong);
			box-shadow: none;
		}
		.pill-button-danger {
			background: var(--danger);
			border-color: var(--danger);
			color: white;
			box-shadow: 0 3px 8px rgba(190, 18, 60, 0.4);
		}
		.pill-button:hover { filter: brightness(1.05); text-decoration: none; }

		.top-links {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			align-items: center;
			justify-content: flex-end;
			font-size: 12px;
			color: var(--text-muted);
		}
		.top-links > * {
			display: inline-flex;
			align-items: center;
			white-space: nowrap;
		}

		.content-shell {
			display: grid;
			grid-template-columns: minmax(0, 3fr) minmax(240px, 1fr);
			gap: 18px;
			align-items: flex-start;
		}

		.main-card {
			background: rgba(255, 255, 255, 0.9);
			border-radius: var(--radius-lg);
			border: 1px solid rgba(209, 213, 219, 0.7);
			box-shadow: var(--shadow-soft);
			padding: 18px 20px 24px;
			backdrop-filter: blur(12px);
		}

		.sidebar-card {
			background: rgba(255, 255, 255, 0.8);
			border-radius: 18px;
			border: 1px solid rgba(209, 213, 219, 0.8);
			padding: 16px 16px 18px;
			box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
		}
		.sidebar-heading {
			font-size: 13px;
			font-weight: 600;
			margin-bottom: 8px;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			color: var(--text-muted);
		}
		.sidebar-item {
			font-size: 13px;
			padding: 6px 0;
			display: flex;
			justify-content: space-between;
			color: var(--text-muted);
		}

		.stopwatch-card {
			border-radius: 12px;
			border: 1px dashed var(--border-strong);
			padding: 10px 12px;
			background: #f9fafb;
			margin-top: 6px;
			margin-bottom: 6px;
		}
		.stopwatch-time {
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
			font-size: 18px;
			font-weight: 600;
			margin-bottom: 6px;
		}
		.stopwatch-buttons {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
			margin-bottom: 4px;
		}
		.stopwatch-hint {
			font-size: 11px;
			color: var(--text-muted);
		}

		.personal-note-form {
			margin-top: 6px;
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.personal-note-textarea {
			width: 100%;
			min-height: 70px;
			border-radius: 8px;
			border: 1px solid var(--border);
			padding: 6px 8px;
			font-size: 12px;
			resize: vertical;
			font-family: inherit;
		}
		.personal-note-save {
			align-self: flex-start;
			padding-inline: 10px;
			font-size: 12px;
		}
		.personal-note-hint {
			font-size: 11px;
			color: var(--text-muted);
			margin-top: 2px;
		}

		.filter-bar {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			align-items: center;
			padding: 10px 12px;
			border-radius: 999px;
			background: var(--surface-alt);
			border: 1px solid var(--border);
			margin-bottom: 16px;
		}
		.filter-label {
			font-size: 12px;
			color: var(--text-muted);
		}
		.filter-select {
			border-radius: 999px;
			border: 1px solid var(--border);
			padding: 5px 10px;
			font-size: 13px;
			background: white;
		}
		.filter-clear {
			font-size: 11px;
			color: var(--text-muted);
		}

		.day-section {
			margin-bottom: 18px;
		}
		.day-header {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			margin-bottom: 8px;
		}
		.day-title {
			font-size: 15px;
			font-weight: 600;
			margin: 0;
			padding-bottom: 4px;
			border-bottom: 2px solid var(--border-strong);
		}
		.day-meta {
			font-size: 11px;
			color: var(--text-muted);
			display: flex;
			gap: 12px;
		}

		.log-card {
			border-radius: 12px;
			border: 1px solid var(--border);
			background: var(--surface-alt);
			padding: 10px 12px;
			margin-bottom: 10px;
		}
		.log-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 6px;
		}
		.hours-row {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			font-size: 12px;
			margin-top: 4px;
		}
		.hours-label {
			color: var(--text-muted);
		}
		.hours-value {
			font-weight: 600;
			color: #16a34a;
		}
		.log-id {
			font-size: 11px;
			color: var(--text-muted);
		}
		.log-body {
			font-size: 13px;
			line-height: 1.5;
		}
		.log-body h1, .log-body h2, .log-body h3 {
			margin-top: 10px;
			margin-bottom: 6px;
		}
		.log-body p {
			margin: 4px 0;
		}
		.log-body ul {
			margin: 4px 0 4px 20px;
		}
		.media-element {
			max-width: 100%;
			height: auto;
			border-radius: 8px;
			margin-top: 8px;
		}

		.pagination {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10px;
			margin-top: 14px;
		}
		.page-link {
			padding: 6px 12px;
			border-radius: var(--radius-pill);
			border: 1px solid var(--border-strong);
			background: rgba(255, 255, 255, 0.9);
			color: var(--text-main);
			text-decoration: none;
			font-size: 13px;
		}
		.page-link.disabled {
			pointer-events: none;
			opacity: 0.5;
		}
		.page-meta {
			font-size: 13px;
			color: var(--text-muted);
		}

		.admin-actions {
			margin-top: 8px;
			display: flex;
			gap: 8px;
		}

		.username-badge {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 2px 8px;
			border-radius: 999px;
			background: var(--accent-soft);
			color: #0369a1;
			font-size: 11px;
			font-weight: 500;
		}
		.username-anon {
			background: #f3f4f6;
			color: var(--text-muted);
		}

		@media (max-width: 840px) {
			.content-shell {
				grid-template-columns: minmax(0, 1fr);
			}
		}
	</style>
</head>
<body>
	<div class="page-shell">
		<div class="page-inner">
			<header class="site-header">
				<div class="brand">
					<div class="brand-logo">DL</div>
					<div>
						<div class="brand-title">Daily Logger</div>
						<div class="brand-subtitle">Internal dev-style worklog</div>
					</div>
				</div>
				<div class="top-links">
					${
						currentUser
							? `<span>User: @${escapeHtml(
									currentUser
								)}</span> <a href="/logout" class="pill-button pill-button-ghost">User Logout</a>`
							: `<a href="/login" class="pill-button pill-button-ghost">User Login</a>`
					}
					<a href="/policy" class="pill-button pill-button-ghost">Timekeeping Policy</a>
					${
						admin
							? `
								<span>Admin</span>
								<a href="/admin/panel" class="pill-button pill-button-ghost">Admin Panel</a>
								<a href="/admin/logout" class="pill-button pill-button-ghost">Logout</a>
							`
							: `<a href="/admin" class="pill-button pill-button-ghost">Admin</a>`
					}
					<a href="/new" class="pill-button">➕ New Log</a>
				</div>
			</header>

			<div class="content-shell">
				<main class="main-card">
					${filterFormHtml}
					${pinnedNoteHtml}
					${activeRangeSummary}
					<div
						id="logStream"
						data-base-qs="${escapeHtml(baseQs)}"
						data-page="${page}"
						data-total-pages="${totalPages}"
					>
						${contentHtml}
					</div>
					<div id="logStreamLoader" class="sub" style="display:none; margin-top:10px;">Loading more logs…</div>
					${paginationHtml}
				</main>

				<aside class="sidebar-card">
					<div class="sidebar-heading">Tips</div>
					<div class="sidebar-item">
						<span>Markdown formatting</span>
					</div>
					<div class="sidebar-item">
						<span>Paste images directly</span>
					</div>
					<div class="sidebar-item">
						<span>Use headings &amp; lists</span>
					</div>

					${stopwatchSidebarHtml}
					${personalNoteSidebarHtml}

					<div class="sidebar-heading" style="margin-top:10px;">Users &amp; Hours</div>
					<div class="sidebar-item">
						<span>Total (current filter)</span>
						<span>${overallHoursFiltered.toFixed(1)}h</span>
					</div>
					${
						filteredUsernames.length
							? filteredUsernames
									.map((u) => {
										const total = perUserTotalsFiltered[u] || 0;
										return `<div class="sidebar-item"><span>@${escapeHtml(
											u
										)}</span><span>${total.toFixed(1)}h</span></div>`;
									})
									.join("")
							: '<div class="sidebar-item"><span>No users for this filter</span></div>'
					}
				</aside>
			</div>
		</div>
	</div>

	<script>
		// Infinite scroll (loads 50 logs at a time)
		(function () {
			var stream = document.getElementById("logStream");
			if (!stream) return;
			var loader = document.getElementById("logStreamLoader");
			var baseQs = stream.getAttribute("data-base-qs") || "";
			var page = parseInt(stream.getAttribute("data-page") || "1", 10) || 1;
			var totalPages = parseInt(stream.getAttribute("data-total-pages") || "1", 10) || 1;
			var loading = false;

			// Keep link-based pagination as a no-JS fallback; hide it when JS runs.
			var pagination = document.querySelector(".pagination");
			if (pagination) pagination.style.display = "none";

			function buildUrl(nextPage) {
				var qs = baseQs ? baseQs + "&" : "";
				return "/logs/page?" + qs + "page=" + encodeURIComponent(String(nextPage));
			}

			function mergeAndAppend(html) {
				var temp = document.createElement("div");
				temp.innerHTML = html;
				var sections = temp.querySelectorAll("section.day-section");
				for (var i = 0; i < sections.length; i++) {
					var section = sections[i];
					var day = section.getAttribute("data-day") || "";
					if (!day) {
						stream.appendChild(section);
						continue;
					}
					var existing = stream.querySelector('section.day-section[data-day="' + CSS.escape(day) + '"]');
					if (!existing) {
						stream.appendChild(section);
						continue;
					}
					var existingLogs = existing.querySelector(".day-logs");
					var newLogs = section.querySelector(".day-logs");
					if (!existingLogs || !newLogs) {
						stream.appendChild(section);
						continue;
					}
					while (newLogs.firstChild) {
						existingLogs.appendChild(newLogs.firstChild);
					}
				}
			}

			async function loadNext() {
				if (loading) return;
				if (page >= totalPages) return;
				loading = true;
				if (loader) loader.style.display = "block";
				try {
					var nextPage = page + 1;
					var res = await fetch(buildUrl(nextPage), { headers: { "Accept": "application/json" } });
					if (!res.ok) return;
					var data = await res.json();
					if (!data || typeof data.sectionsHtml !== "string") return;
					mergeAndAppend(data.sectionsHtml);
					page = Number(data.page) || nextPage;
					stream.setAttribute("data-page", String(page));
					if (typeof data.totalPages === "number") {
						totalPages = data.totalPages;
						stream.setAttribute("data-total-pages", String(totalPages));
					}
				} catch (e) {
					// swallow; user can still use link pagination without JS
				} finally {
					loading = false;
					if (loader) loader.style.display = page < totalPages ? "none" : "none";
				}
			}

			var ticking = false;
			function onScroll() {
				if (ticking) return;
				ticking = true;
				requestAnimationFrame(function () {
					ticking = false;
					if (loading) return;
					if (page >= totalPages) return;
					var nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
					if (nearBottom) loadNext();
				});
			}

			window.addEventListener("scroll", onScroll);
			// Also attempt immediately in case the first page is short
			onScroll();
		})();

		// Pinned note "Copy Link"
		(function () {
			const btn = document.getElementById("copyPinnedLink");
			if (!btn) return;
			btn.addEventListener("click", function () {
				const relative = btn.getAttribute("data-url") || "/";
				const url = window.location.origin + relative;
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(url)
						.then(function () {
							const old = btn.textContent;
							btn.textContent = "Link copied!";
							setTimeout(function () {
								btn.textContent = old;
							}, 1500);
						})
						.catch(function () {
							window.prompt("Copy this URL:", url);
						});
				} else {
					window.prompt("Copy this URL:", url);
				}
			});
		})();

		// Personal Stopwatch
		(function () {
			const root = document.querySelector("[data-stopwatch]");
			if (!root) return;

			const display = document.getElementById("stopwatchTime");
			const startBtn = document.getElementById("swStart");
			const pauseBtn = document.getElementById("swPause");
			const resetBtn = document.getElementById("swReset");

			let elapsed = Number(root.getAttribute("data-initial-elapsed") || "0");
			let running = root.getAttribute("data-initial-running") === "1";
			let timerId = null;

			function pad(n) {
				return String(n).padStart(2, "0");
			}
			function render() {
				const h = Math.floor(elapsed / 3600);
				const m = Math.floor((elapsed % 3600) / 60);
				const s = elapsed % 60;
				if (display) {
					display.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
				}
			}

			function ensureTimer() {
				if (timerId) {
					clearInterval(timerId);
					timerId = null;
				}
				if (!running) return;
				timerId = setInterval(function () {
					elapsed++;
					render();
				}, 1000);
			}

			async function send(action) {
				try {
					const res = await fetch("/me/stopwatch", {
						method: "POST",
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						body: "action=" + encodeURIComponent(action)
					});
					if (!res.ok) return;
					const data = await res.json();
					if (!data || typeof data.elapsedSeconds !== "number") return;
					elapsed = data.elapsedSeconds;
					running = !!data.isRunning;
					render();
					ensureTimer();
				} catch (e) {
					console.error("Stopwatch update failed:", e);
				}
			}

			if (startBtn) startBtn.addEventListener("click", function () { send("start"); });
			if (pauseBtn) pauseBtn.addEventListener("click", function () { send("pause"); });
			if (resetBtn) resetBtn.addEventListener("click", function () {
				if (confirm("Reset your stopwatch?")) {
					send("reset");
				}
			});

			render();
			ensureTimer();
		})();
	</script>
</body>
</html>
`;

							res.send(html);
					})().catch((err) => {
						console.error("Homepage render failed:", err);
						if (!res.headersSent) {
							res.status(500).send("DB error");
						}
					});
				}

				if (!personalUsername) {
					// No per-user data without a username
					proceedWithLogs();
				} else {
					db.get(
						"SELECT * FROM user_stopwatches WHERE username = ?",
						[personalUsername],
						(swErr, swRow) => {
							if (swErr) {
								console.error("Error loading stopwatch:", swErr);
							} else if (swRow) {
								let elapsed = Number(swRow.elapsed_ms) || 0;
								const running = !!swRow.is_running;
								const lastStarted = swRow.last_started_at != null
									? Number(swRow.last_started_at)
									: null;

								if (running && lastStarted != null) {
									elapsed += Math.max(0, nowMs - lastStarted);
								}

								swInitialSeconds = Math.floor(elapsed / 1000);
								swInitialRunning = running;
							}

							db.get(
								"SELECT content FROM user_personal_notes WHERE username = ?",
								[personalUsername],
								(noteErr, noteRow) => {
									if (noteErr) {
										console.error("Error loading personal note:", noteErr);
									} else if (noteRow && noteRow.content != null) {
										personalNoteContent = noteRow.content;
									}
									proceedWithLogs();
								}
							);
						}
					);
				}
			}
		);
	});

	// ---------- Homepage infinite-scroll page loader (JSON) ----------
	app.get("/logs/page", (req, res) => {
		// Force initial admin setup before anything else
		if (getRequireAdminSetup()) {
			res.status(400).json({ error: "admin_setup_required" });
			return;
		}

		const userFilter = req.query.user || "";
		const period = req.query.period || "";
		const dateRef = req.query.date || "";

		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		if (!currentUser && !admin) {
			res.status(401).json({ error: "login_required" });
			return;
		}

		const CONTACT_EMAIL = getContactEmail();
		const CONTACT_DISCORD = getContactDiscord();

		const dbAllAsync = (sql, params = []) =>
			new Promise((resolve, reject) => {
				db.all(sql, params, (err, rows) => {
					if (err) return reject(err);
					resolve(rows || []);
				});
			});
		const dbGetAsync = (sql, params = []) =>
			new Promise((resolve, reject) => {
				db.get(sql, params, (err, row) => {
					if (err) return reject(err);
					resolve(row || null);
				});
			});

		(async () => {
			// ----- Date range filtering (day / week / month / year) -----
			let rangeStart = null;
			let rangeEnd = null;
			if (period && dateRef) {
				const base = new Date(dateRef);
				if (!isNaN(base.getTime())) {
					const y = base.getFullYear();
					const m = base.getMonth();
					const d = base.getDate();
					if (period === "day") {
						const start = new Date(y, m, d);
						const end = new Date(y, m, d);
						rangeStart = start.toISOString().split("T")[0];
						rangeEnd = end.toISOString().split("T")[0];
					} else if (period === "week") {
						const dayOfWeek = base.getDay();
						const offsetToMonday = (dayOfWeek + 6) % 7;
						const start = new Date(base);
						start.setDate(base.getDate() - offsetToMonday);
						const end = new Date(start);
						end.setDate(start.getDate() + 6);
						rangeStart = start.toISOString().split("T")[0];
						rangeEnd = end.toISOString().split("T")[0];
					} else if (period === "month") {
						const start = new Date(y, m, 1);
						const end = new Date(y, m + 1, 0);
						rangeStart = start.toISOString().split("T")[0];
						rangeEnd = end.toISOString().split("T")[0];
					} else if (period === "year") {
						const start = new Date(y, 0, 1);
						const end = new Date(y, 11, 31);
						rangeStart = start.toISOString().split("T")[0];
						rangeEnd = end.toISOString().split("T")[0];
					}
				}
			}

			const PAGE_SIZE = 50;
			const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);

			const whereParts = [];
			const whereParams = [];
			if (rangeStart && rangeEnd) {
				whereParts.push("l.date >= ? AND l.date <= ?");
				whereParams.push(rangeStart, rangeEnd);
			}
			if (userFilter) {
				whereParts.push("l.username = ?");
				whereParams.push(userFilter);
			}
			const whereSql = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";

			const countRow = await dbGetAsync(
				`SELECT COUNT(*) AS totalCount
				 FROM logs l
				 ${whereSql}`,
				whereParams
			);
			const totalCount = (countRow && countRow.totalCount) || 0;
			const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
			const page = Math.min(requestedPage, totalPages);
			const offset = (page - 1) * PAGE_SIZE;

			const pageRows = await dbAllAsync(
				`SELECT l.*,
						EXISTS(SELECT 1 FROM log_history h WHERE h.log_id = l.id) AS has_history
				 FROM logs l
				 ${whereSql}
				 ORDER BY l.date DESC, l.id DESC
				 LIMIT ? OFFSET ?`,
				[...whereParams, PAGE_SIZE, offset]
			);

			const grouped = {};
			pageRows.forEach((log) => {
				const key = log.date || "No Date";
				if (!grouped[key]) grouped[key] = [];
				grouped[key].push(log);
			});
			const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

			const sectionsHtml = dates
				.map((date) => {
					const logs = grouped[date];
					const totalHours = logs.reduce(
						(sum, log) => sum + (Number(log.hours) || 0),
						0
					);
					const countEntries = logs.length;

					const logsHtml = logs
						.map((log) => {
							let mediaHtml = "";
							if (log.media_path) {
								const safePath = escapeHtml(log.media_path);
								if (log.media_type === "video") {
									mediaHtml = `
									<div class="media">
										<video controls preload="metadata" class="media-element">
											<source src="${safePath}">
											Your browser does not support the video tag.
										</video>
									</div>
								`;
								} else {
									mediaHtml = `
									<div class="media">
										<img src="${safePath}" loading="lazy" class="media-element" alt="Log media">
									</div>
								`;
								}
							} else if (log.image_url) {
								mediaHtml = `
								<div class="media">
									<img src="${escapeHtml(log.image_url)}" loading="lazy" class="media-element" alt="Log image">
								</div>
							`;
							}

							const adminActions = admin
								? `
									<div class="admin-actions">
										<a href="/edit/${log.id}" class="pill-button pill-button-ghost">Edit</a>
										<form method="POST" action="/delete/${log.id}" style="display:inline;" onsubmit="return confirm('Delete this log?');">
											<button type="submit" class="pill-button pill-button-danger">Delete</button>
										</form>
									</div>
								`
								: "";

							const usernameLabel = log.username
								? `<span class="username-badge">@${escapeHtml(log.username)}</span>`
								: `<span class="username-badge username-anon">[no user]</span>`;

							const editedBadge = log.has_history
								? '<span class="edited-badge">Edited</span>'
								: "";

							return `
								<article class="log-card">
									<header class="log-header">
										<div>
											${usernameLabel}
											${editedBadge}
											<div class="hours-row">
												<span class="hours-label">Hours</span>
												<span class="hours-value">${log.hours}</span>
											</div>
										</div>
										<div class="log-id">#${log.id}</div>
									</header>
									<div class="log-body">
										${marked.parse(log.content || "")}
										${mediaHtml}
									</div>
									${adminActions}
									<div class="log-footer">
										${
											log.has_history
												? `<a href="/logs/${log.id}/history" class="history-link">View edit history</a> · `
												: ""
										}
										<span class="dispute-hint">
											If you believe this log is incorrect, contact
											<code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code>.
										</span>
									</div>
								</article>
							`;
						})
						.join("");

					return `
						<section class="day-section" data-day="${escapeHtml(date)}">
							<div class="day-header">
								<h2 class="day-title">${escapeHtml(date)}</h2>
								<div class="day-meta">
									<span>${countEntries} entr${countEntries === 1 ? "y" : "ies"}</span>
									<span>${totalHours.toFixed(2)} total hours</span>
								</div>
							</div>
							<div class="day-logs">${logsHtml}</div>
						</section>
					`;
				})
				.join("");

			res.json({ sectionsHtml, page, totalPages });
		})().catch((err) => {
			console.error("/logs/page failed:", err);
			res.status(500).json({ error: "db_error" });
		});
	});
	}

function registerLogsWriteRoutes(app, deps) {
	const {
		db,
		upload,
		getCurrentUser,
		isAdmin,
		getSetting,
	} = deps;

	// ---------- Edit form (admin only, with upload & paste) ----------
	app.post("/edit/:id", upload.single("media"), (req, res) => {
		if (!isAdmin(req)) {
			res.status(403).send("Forbidden");
			return;
		}

		const id = req.params.id;
		const { date, hours, content, image_url, username } = req.body;

		// Fetch the current log row so we can store it in history
		db.get(
			"SELECT * FROM logs WHERE id = ?",
			[id],
			(err, currentLog) => {
				if (err || !currentLog) {
					return res.status(404).send("Log not found");
				}

				// Determine editor (only admin can edit right now, but we still store it)
				const editorUsername = getCurrentUser(req) || "admin";
				const editedAt = new Date().toISOString();

				// Insert the old state into log_history
				db.run(
					`INSERT INTO log_history (
					log_id,
					edited_at,
					editor_username,
					old_date,
					old_hours,
					old_content,
					old_image_url,
					old_media_path,
					old_media_type,
					old_username
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						id,
						editedAt,
						editorUsername,
						currentLog.date || null,
						currentLog.hours || null,
						currentLog.content || null,
						currentLog.image_url || null,
						currentLog.media_path || null,
						currentLog.media_type || null,
						currentLog.username || null,
					],
					(histErr) => {
						if (histErr) {
							console.error("Failed to insert log_history:", histErr);
							// We still proceed with the update, but we log the error.
						}

						// Now handle the new media / updated fields as before
						let mediaPath = currentLog.media_path;
						let mediaType = currentLog.media_type;

						if (req.file) {
							mediaPath = "/uploads/" + req.file.filename;
							if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
								mediaType = "video";
							} else {
								mediaType = "image";
							}
						}

						db.run(
							"UPDATE logs SET date = ?, hours = ?, content = ?, image_url = ?, media_path = ?, media_type = ?, username = ? WHERE id = ?",
							[
								date,
								hours,
								content,
								image_url || null,
								mediaPath,
								mediaType,
								username || null,
								id,
							],
							() => res.redirect("/")
						);
					}
				);
			}
		);
	});

	// ---------- Create new log ----------
	app.post("/new", upload.single("media"), (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		const userNameForLog = currentUser || (admin ? "admin" : null);
		if (!userNameForLog) {
			res.redirect("/login");
			return;
		}

		const { date, hours, content, image_url } = req.body;

		let mediaPath = null;
		let mediaType = null;

		if (req.file) {
			mediaPath = "/uploads/" + req.file.filename;
			if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
				mediaType = "video";
			} else {
				mediaType = "image";
			}
		}

		db.run(
			"INSERT INTO logs (date, hours, content, image_url, media_path, media_type, username) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				date,
				hours,
				content,
				image_url || null,
				mediaPath,
				mediaType,
				userNameForLog,
			],
			() => res.redirect("/")
		);
	});

	// ---------- Edit existing log (admin only) ----------
	app.post("/edit/:id", upload.single("media"), (req, res) => {
		if (!isAdmin(req)) {
			res.status(403).send("Forbidden");
			return;
		}

		const id = req.params.id;
		const { date, hours, content, image_url, username } = req.body;

		db.get(
			"SELECT media_path, media_type FROM logs WHERE id = ?",
			[id],
			(err, row) => {
				let mediaPath = row ? row.media_path : null;
				let mediaType = row ? row.media_type : null;

				if (req.file) {
					mediaPath = "/uploads/" + req.file.filename;
					if (req.file.mimetype && req.file.mimetype.startsWith("video/")) {
						mediaType = "video";
					} else {
						mediaType = "image";
					}
				}

				db.run(
					"UPDATE logs SET date = ?, hours = ?, content = ?, image_url = ?, media_path = ?, media_type = ?, username = ? WHERE id = ?",
					[
						date,
						hours,
						content,
						image_url || null,
						mediaPath,
						mediaType,
						username || null,
						id,
					],
					() => res.redirect("/")
				);
			}
		);
	});

	// ---------- Personal stopwatch (per user) ----------
	app.post("/me/stopwatch", (req, res) => {
		const username = getCurrentUser(req) || null;
		if (!username) {
			res.status(403).json({ error: "Not logged in" });
			return;
		}

		const action = req.body.action;
		const now = Date.now();

		db.get(
			"SELECT * FROM user_stopwatches WHERE username = ?",
			[username],
			(err, row) => {
				if (err) {
					console.error("Error loading stopwatch:", err);
					return res.status(500).json({ error: "DB error" });
				}

				let elapsed =
					row && typeof row.elapsed_ms === "number"
						? row.elapsed_ms
						: Number(row && row.elapsed_ms) || 0;
				let isRunning = row ? !!row.is_running : false;
				let lastStarted =
					row && row.last_started_at != null ? Number(row.last_started_at) : null;

				// If it was running, first bring elapsed up to now.
				if (isRunning && lastStarted != null && action !== "reset") {
					elapsed += Math.max(0, now - lastStarted);
					lastStarted = now;
				}

				if (action === "start") {
					if (!isRunning) {
						isRunning = true;
						lastStarted = now;
					}
				} else if (action === "pause") {
					if (isRunning && lastStarted != null) {
						elapsed += Math.max(0, now - lastStarted);
					}
					isRunning = false;
					lastStarted = null;
				} else if (action === "reset") {
					elapsed = 0;
					isRunning = false;
					lastStarted = null;
				}

				db.run(
					"INSERT OR REPLACE INTO user_stopwatches (username, elapsed_ms, is_running, last_started_at) VALUES (?, ?, ?, ?)",
					[username, elapsed, isRunning ? 1 : 0, isRunning ? now : null],
					(err2) => {
						if (err2) {
							console.error("Error saving stopwatch:", err2);
							return res.status(500).json({ error: "DB error" });
						}

						const effectiveElapsed =
							isRunning && lastStarted != null
								? elapsed + (Date.now() - lastStarted)
								: elapsed;

						res.json({
							ok: true,
							elapsedSeconds: Math.floor(effectiveElapsed / 1000),
							isRunning,
						});
					}
				);
			}
		);
	});

	// ---------- Personal note (per user) ----------
	app.post("/me/note", (req, res) => {
		const currentUser = getCurrentUser(req);
		const admin = isAdmin(req);
		const userNameForLog = currentUser || (admin ? "admin" : null);

		const username = getCurrentUser(req) || null;
		if (!userNameForLog) {
			return res.status(403).send("Not logged in");
		}

		const content = req.body.content || "";
		const updatedAt = new Date().toISOString();

		db.run(
			"INSERT OR REPLACE INTO user_personal_notes (username, content, updated_at) VALUES (?, ?, ?)",
			[username, content, updatedAt],
			(err) => {
				if (err) {
					console.error("Error saving personal note:", err);
					return res.status(500).send("Failed to save note");
				}
				res.redirect("/");
			}
		);
	});

	// ---------- Soft delete log (admin only, with legal hold + audit) ----------
	app.post("/delete/:id", (req, res) => {
		if (!isAdmin(req)) {
			return res.status(403).send("Forbidden");
		}

		const id = req.params.id;

		// 1) Check legal hold flag
		getSetting("legal_hold", (err, val) => {
			if (err) {
				console.error("Error reading legal_hold setting:", err);
				return res
					.status(500)
					.send("Error reading legal hold setting. Deletion blocked.");
			}

			if (val === "1") {
				// Legal hold active → block deletion
				return res
					.status(403)
					.send(
						"Deletion is currently disabled because a legal hold is active. " +
							'<a href="/">Back</a>'
					);
			}

			// 2) Load the log to record a deletion entry
			db.get("SELECT * FROM logs WHERE id = ?", [id], (selErr, log) => {
				if (selErr || !log) {
					return res.status(404).send("Log not found.");
				}

				const deletedAt = new Date().toISOString();
				const deletedBy = getCurrentUser(req) || "admin";

				// If you later add a textarea for reason, pick it up here:
				const reason = (req.body.reason || "").trim() || null;

				// 3) Record deletion in audit table
				db.run(
					"INSERT INTO log_deletions (log_id, deleted_at, deleted_by, reason) VALUES (?, ?, ?, ?)",
					[id, deletedAt, deletedBy, reason],
					(histErr) => {
						if (histErr) {
							console.error("Failed to insert log_deletions:", histErr);
							// Still continue; don't break the UX
						}

						// 4) Soft delete the log (keep it in DB, mark as deleted)
						db.run(
							"UPDATE logs SET deleted = 1, deleted_at = ?, deleted_by = ?, delete_reason = ? WHERE id = ?",
							[deletedAt, deletedBy, reason, id],
							(updErr) => {
								if (updErr) {
									console.error("Soft delete update failed:", updErr);
									return res
										.status(500)
										.send("Error deleting log. It may still exist.");
								}
								res.redirect("/");
							}
						);
					}
				);
			});
		});
	});
}

module.exports = {
	registerLogsReadRoutes,
	registerLogsWriteRoutes,
};
