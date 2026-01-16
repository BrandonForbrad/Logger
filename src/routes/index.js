const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const db = require("../config/database");
const { DB_PATH, uploadDir, backupsDir } = require("../config/paths");
const settingsConfig = require("../config/settings");
const views = require("../views");

const upload = require("../middleware/upload");
const { createSessionTools } = require("../middleware/session");
const { createDbSettings } = require("../utils/dbSettings");
const { createBackup, restoreFromBackup } = require("../utils/backupCompat");
const { formatBytes, getDirectorySize, getDiskUsage } = require("../utils/system");
const { restartSelf } = require("../utils/restartSelf");
const { escapeHtml } = require("../utils/helpers");
const { isAdmin, getCurrentUser } = require("../utils/requestContext");

const registerAuthRoutes = require("./auth");
const registerAdminRoutes = require("./admin");
const registerPinnedRoutes = require("./pinned");
const { registerLogsReadRoutes, registerLogsWriteRoutes } = require("./logs");
const registerAdminCoreRoutes = require("./adminCore");
const registerUploaderRoutes = require("./uploader");
const registerSystemsRoutes = require("./systems");

const app = express();

const BUILD_ID = process.env.DL_BUILD_ID || new Date().toISOString();

// Version markers for debugging client-side UI updates.
app.use((req, res, next) => {
	res.setHeader("X-DailyLogger-Build", BUILD_ID);
	res.setHeader("X-Upload-UI-Version", BUILD_ID);
	return next();
});

// Quick sanity endpoint to confirm which server instance you're hitting.
app.get("/__version", (req, res) => {
	res.json({
		build: BUILD_ID,
		uploadUiVersion: BUILD_ID,
		pid: process.pid,
		node: process.version,
	});
});

// Ensure storage directories exist (repo-root, same as original behavior)
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

app.use(
	"/uploads",
	express.static(uploadDir, {
		etag: true,
		lastModified: true,
		maxAge: "365d",
		immutable: true,
		setHeaders: (res) => {
			res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
		},
	})
);

// Avoid caching HTML/inline scripts so UI updates show up immediately.
// Keep /uploads immutable caching intact.
app.use((req, res, next) => {
	if (req.path && String(req.path).startsWith("/uploads")) return next();
	res.setHeader("Cache-Control", "no-store");
	return next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Settings (default password, admin setup, contact info)
settingsConfig.loadSettings();

// Session middleware (cookie name must remain "session")
const { sessionMiddleware, createSession, destroyCurrentSession } =
	createSessionTools(db);
app.use(sessionMiddleware);

const { getSetting, setSetting } = createDbSettings(db);

// ---------- Route registration (keep order identical) ----------
registerLogsReadRoutes(app, {
	db,
	marked,
	views,
	escapeHtml,
	getCurrentUser,
	isAdmin,
	getRequireAdminSetup: () => settingsConfig.settings.REQUIRE_ADMIN_SETUP,
	getContactEmail: () => settingsConfig.settings.CONTACT_EMAIL,
	getContactDiscord: () => settingsConfig.settings.CONTACT_DISCORD,
});

registerAdminCoreRoutes(app, {
	db,
	bcrypt,
	views,
	escapeHtml,
	getSetting,
	setSetting,
	isAdmin,
	createSession,
	destroyCurrentSession,
	updateDefaultPassword: settingsConfig.updateDefaultPassword,
	updateContactSettings: settingsConfig.updateContactSettings,
	getRequireAdminSetup: () => settingsConfig.settings.REQUIRE_ADMIN_SETUP,
	getAdminPasswordHash: () => settingsConfig.settings.ADMIN_PASSWORD_HASH,
	getDefaultPassword: () => settingsConfig.settings.DEFAULT_PASSWORD,
	getContactEmail: () => settingsConfig.settings.CONTACT_EMAIL,
	getContactDiscord: () => settingsConfig.settings.CONTACT_DISCORD,
	saveAdminPasswordHash: settingsConfig.saveAdminPasswordHash,
});

registerPinnedRoutes(app, {
	db,
	marked,
	views,
	getCurrentUser,
	isAdmin,
	escapeHtml,
	upload,
});

app.get("/policy", (req, res) => {
	res.send(
		views.policyPage({
			CONTACT_EMAIL: settingsConfig.settings.CONTACT_EMAIL,
			CONTACT_DISCORD: settingsConfig.settings.CONTACT_DISCORD,
		})
	);
});

registerAuthRoutes(app, {
	db,
	bcrypt,
	upload,
	views,
	getDefaultPassword: () => settingsConfig.settings.DEFAULT_PASSWORD,
	getContactEmail: () => settingsConfig.settings.CONTACT_EMAIL,
	getContactDiscord: () => settingsConfig.settings.CONTACT_DISCORD,
	getCurrentUser,
	isAdmin,
	createSession,
	destroyCurrentSession,
	escapeHtml,
});

registerUploaderRoutes(app, {
	db,
	upload,
	views,
	escapeHtml,
	getCurrentUser,
	isAdmin,
});

registerSystemsRoutes(app, {
	db,
	isAdmin,
	getCurrentUser,
	escapeHtml,
	upload,
	views,
	uploadDir,
});

registerLogsWriteRoutes(app, {
	db,
	upload,
	getCurrentUser,
	isAdmin,
	getSetting,
});

registerAdminRoutes(app, {
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
	getDiskUsage: (cb) => getDiskUsage(cb, uploadDir),
	createBackup: (cb) => createBackup({ DB_PATH, uploadDir, backupsDir }, cb),
	restoreFromBackup: (backupFilePath, cb) =>
		restoreFromBackup({ db, DB_PATH, uploadDir }, backupFilePath, cb),
	restartSelf,
});

// ---------- Upload error handling ----------
app.use((err, req, res, next) => {
	if (err && err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			const max = Number(process.env.UPLOAD_MAX_BYTES) || 4 * 1024 * 1024 * 1024;
			res
				.status(413)
				.send(
					`File too large. Max upload is ${Math.floor(max / (1024 * 1024))} MB. ` +
						`Set UPLOAD_MAX_BYTES to increase the limit.`
				);
			return;
		}
		res.status(400).send(`Upload failed: ${err.message}`);
		return;
	}
	next(err);
});

module.exports = app;
