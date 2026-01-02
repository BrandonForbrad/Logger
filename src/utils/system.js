const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function formatBytes(bytes) {
	if (!bytes || bytes <= 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const value = bytes / Math.pow(k, i);
	return value.toFixed(2) + " " + sizes[i];
}

function getDirectorySize(dirPath) {
	let total = 0;
	if (!fs.existsSync(dirPath)) return 0;
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dirPath, entry.name);
		const stat = fs.statSync(full);
		if (entry.isDirectory()) {
			total += getDirectorySize(full);
		} else {
			total += stat.size;
		}
	}
	return total;
}

function copyRecursive(src, dest) {
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const s = path.join(src, entry.name);
		const d = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			if (!fs.existsSync(d)) fs.mkdirSync(d);
			copyRecursive(s, d);
		} else {
			fs.copyFileSync(s, d);
		}
	}
}

function getDiskUsage(callback, dirForPosixDf) {
	const root = path.parse(__dirname).root; // "D:\" or "/"
	if (process.platform === "win32") {
		const drive = root.replace(/\\$/, ""); // "D:"
		const cmd = `wmic logicaldisk where "DeviceID='${drive}'" get Size,FreeSpace /format:value`;
		exec(cmd, (err, stdout) => {
			if (err || !stdout) {
				return callback(null, null);
			}
			const sizeMatch = stdout.match(/Size=(\d+)/);
			const freeMatch = stdout.match(/FreeSpace=(\d+)/);
			if (!sizeMatch || !freeMatch) {
				return callback(null, null);
			}
			const totalBytes = parseInt(sizeMatch[1], 10);
			const freeBytes = parseInt(freeMatch[1], 10);
			callback(null, { totalBytes, freeBytes });
		});
		return;
	}

	exec(`df -k "${dirForPosixDf || __dirname}"`, (err, stdout) => {
		if (err || !stdout) {
			return callback(null, null);
		}
		const lines = stdout.trim().split(/\r?\n/);
		if (lines.length < 2) return callback(null, null);
		const parts = lines[1].trim().split(/\s+/);
		const totalK = parseInt(parts[1], 10);
		const availK = parseInt(parts[3], 10);
		if (isNaN(totalK) || isNaN(availK)) {
			return callback(null, null);
		}
		callback(null, {
			totalBytes: totalK * 1024,
			freeBytes: availK * 1024,
		});
	});
}

module.exports = {
	formatBytes,
	getDirectorySize,
	copyRecursive,
	getDiskUsage,
};
