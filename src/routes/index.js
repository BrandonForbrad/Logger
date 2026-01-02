const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
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

const app = express();

// Ensure storage directories exist (repo-root, same as original behavior)
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

app.use("/uploads", express.static(uploadDir));
app.use(bodyParser.urlencoded({ extended: true }));

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

module.exports = app;
