const path = require("path");

// Centralized paths (kept identical to the original root-level server behavior)
const DB_PATH = path.join(__dirname, "../../logs.db");
const uploadDir = path.join(__dirname, "../../uploads");
const backupsDir = path.join(__dirname, "../../backups");

module.exports = {
	DB_PATH,
	uploadDir,
	backupsDir,
};
