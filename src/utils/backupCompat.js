const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require("adm-zip");

const { copyRecursive } = require("./system");

function createBackup({ DB_PATH, uploadDir, backupsDir }, callback) {
	const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
	const filename = `backup-${timestamp}.zip`;
	const backupPath = path.join(backupsDir, filename);

	const output = fs.createWriteStream(backupPath);
	const archive = archiver("zip", { zlib: { level: 9 } });

	output.on("close", () => {
		callback(null, {
			filename,
			path: backupPath,
			size: archive.pointer(),
		});
	});

	archive.on("error", (err) => {
		callback(err);
	});

	archive.pipe(output);

	if (fs.existsSync(DB_PATH)) {
		archive.file(DB_PATH, { name: "logs.db" });
	}
	if (fs.existsSync(uploadDir)) {
		archive.directory(uploadDir, "uploads");
	}

	archive.finalize();
}

function restoreFromBackup(
	{ db, DB_PATH, uploadDir },
	backupFilePath,
	callback
) {
	try {
		if (!fs.existsSync(backupFilePath)) {
			return callback(new Error("Backup file does not exist."));
		}

		const tmpDir = path.join(__dirname, "..", "..", "restore-tmp-" + Date.now());
		fs.mkdirSync(tmpDir);

		const zip = new AdmZip(backupFilePath);
		zip.extractAllTo(tmpDir, true);

		const restoredDbPath = path.join(tmpDir, "logs.db");
		const restoredUploadsPath = path.join(tmpDir, "uploads");

		if (!fs.existsSync(restoredDbPath)) {
			return callback(new Error("Backup is missing logs.db"));
		}

		db.close((closeErr) => {
			if (closeErr) {
				console.error("Error closing DB before restore:", closeErr);
			}

			try {
				if (fs.existsSync(DB_PATH)) {
					const backupName = DB_PATH + ".bak-" + Date.now();
					fs.renameSync(DB_PATH, backupName);
				}

				fs.copyFileSync(restoredDbPath, DB_PATH);

				if (fs.existsSync(restoredUploadsPath)) {
					if (fs.existsSync(uploadDir)) {
						fs.rmSync(uploadDir, { recursive: true, force: true });
					}
					fs.mkdirSync(uploadDir, { recursive: true });
					copyRecursive(restoredUploadsPath, uploadDir);
				}

				fs.rmSync(tmpDir, { recursive: true, force: true });
				callback(null);
			} catch (e) {
				callback(e);
			}
		});
	} catch (e) {
		callback(e);
	}
}

module.exports = {
	createBackup,
	restoreFromBackup,
};
