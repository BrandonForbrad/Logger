const fs = require("fs");
const path = require("path");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCookies(req) {
  const header = req.headers.cookie || "";
  const pairs = header
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const cookies = {};
  for (const p of pairs) {
    const [key, val] = p.split("=");
    cookies[key] = val;
  }
  return cookies;
}

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
  if (!fs.existsSync(dirPath)) return total;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += getDirectorySize(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDiskUsage(callback) {
  const root = path.parse(__dirname).root; // "D:\" or "/"
  if (process.platform === "win32") {
    const { exec } = require("child_process");
    exec(`fsutil volume diskfree ${root}`, (err, stdout, stderr) => {
      if (err) return callback(err);
      const lines = stdout.trim().split("\n");
      const free = parseInt(lines[1].match(/(\d+)/)[0]);
      const total = parseInt(lines[2].match(/(\d+)/)[0]);
      callback(null, { total, free, used: total - free });
    });
  } else {
    const { exec } = require("child_process");
    exec(`df -k "${root}"`, (err, stdout, stderr) => {
      if (err) return callback(err);
      const lines = stdout.trim().split("\n");
      const parts = lines[1].split(/\s+/);
      const total = parseInt(parts[1]) * 1024;
      const used = parseInt(parts[2]) * 1024;
      const free = parseInt(parts[3]) * 1024;
      callback(null, { total, used, free });
    });
  }
}

module.exports = {
  escapeHtml,
  getCookies,
  formatBytes,
  getDirectorySize,
  copyRecursive,
  getDiskUsage,
};
