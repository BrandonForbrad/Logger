const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const multer = require("multer");

// In-memory map of running processes: toolId -> { proc, runId }
const runningProcesses = new Map();

// Each tool gets its own project directory under tools/
const TOOLS_DIR = path.join(process.cwd(), "tools");
if (!fs.existsSync(TOOLS_DIR)) fs.mkdirSync(TOOLS_DIR, { recursive: true });

function getToolDir(toolId) {
	const dir = path.join(TOOLS_DIR, String(toolId));
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

function safeResolvePath(toolDir, filePath) {
	const resolved = path.resolve(toolDir, filePath);
	if (!resolved.startsWith(toolDir + path.sep) && resolved !== toolDir) return null;
	return resolved;
}

function listFilesRecursive(dir, base) {
	base = base || "";
	let results = [];
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return []; }
	entries.sort((a, b) => {
		if (a.isDirectory() && !b.isDirectory()) return -1;
		if (!a.isDirectory() && b.isDirectory()) return 1;
		return a.name.localeCompare(b.name);
	});
	for (const entry of entries) {
		if (entry.name === "node_modules" || entry.name === ".git") continue;
		const relPath = base ? base + "/" + entry.name : entry.name;
		if (entry.isDirectory()) {
			results.push({ name: entry.name, path: relPath, isDir: true });
			results = results.concat(listFilesRecursive(path.join(dir, entry.name), relPath));
		} else {
			results.push({ name: entry.name, path: relPath, isDir: false });
		}
	}
	return results;
}

// ── Project templates per language ──
function getPort(toolId) { return 10000 + toolId; }

const TEMPLATE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1e293b; padding: 32px 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 480px; width: 100%; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .sub { color: #94a3b8; margin-bottom: 20px; font-size: 14px; }
    button { padding: 10px 24px; border: none; border-radius: 999px; background: #3b82f6; color: white; font-weight: 600; cursor: pointer; font-size: 14px; }
    button:hover { background: #2563eb; }
    #result { margin-top: 16px; padding: 12px; background: #0f172a; border-radius: 8px; font-family: 'Cascadia Code', monospace; font-size: 13px; min-height: 20px; text-align: left; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="card">
    <h1>\uD83D\uDE80 My App</h1>
    <p class="sub">Your web app is running! Edit index.html to customize.</p>
    <button onclick="callApi()">Call /api/hello</button>
    <div id="result"></div>
  </div>
  <script>
    function callApi() {
      document.getElementById('result').textContent = 'Loading...';
      fetch('api/hello')
        .then(function(r) { return r.json(); })
        .then(function(d) { document.getElementById('result').textContent = JSON.stringify(d, null, 2); })
        .catch(function(e) { document.getElementById('result').textContent = 'Error: ' + e.message; });
    }
  </script>
</body>
</html>`;

const TEMPLATES = {
	node: {
		main: "index.js",
		run: "node index.js",
		code: `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // --- API routes (add your own here) ---
  if (url.pathname === '/api/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Hello from Node.js!', time: new Date().toISOString() }));
  }

  // --- Serve static files ---
  const filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));
`
	},
	python: {
		main: "main.py",
		run: "python main.py",
		code: `import os, json, datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get('PORT', 3000))

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/hello':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            body = json.dumps({'message': 'Hello from Python!', 'time': datetime.datetime.now().isoformat()})
            self.wfile.write(body.encode())
        else:
            super().do_GET()

print(f'Server running on port {PORT}')
HTTPServer(('', PORT), Handler).serve_forever()
`
	},
	ruby: {
		main: "main.rb",
		run: "ruby main.rb",
		code: `require 'webrick'
require 'json'

port = (ENV['PORT'] || 3000).to_i
server = WEBrick::HTTPServer.new(Port: port, DocumentRoot: __dir__)

server.mount_proc '/api/hello' do |req, res|
  res['Content-Type'] = 'application/json'
  res.body = JSON.generate({ message: 'Hello from Ruby!', time: Time.now.iso8601 })
end

puts "Server running on port #{port}"
trap('INT') { server.shutdown }
server.start
`
	},
	luau: {
		main: "index.js",
		run: "node index.js",
		code: `const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// Run a .luau script and return its stdout as the response
function runLuau(scriptName, args, callback) {
  const scriptPath = path.join(__dirname, scriptName);
  execFile('luau', [scriptPath, ...args], { timeout: 10000 }, (err, stdout, stderr) => {
    if (err) return callback({ error: err.message, stderr });
    callback(null, stdout);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // --- API route: runs main.luau and returns its output ---
  if (url.pathname === '/api/hello') {
    runLuau('main.luau', [], (err, output) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err) return res.end(JSON.stringify({ error: err.error, stderr: err.stderr }));
      // Try to parse as JSON, otherwise wrap as text
      try {
        JSON.parse(output);
        res.end(output);
      } catch (e) {
        res.end(JSON.stringify({ output: output.trim() }));
      }
    });
    return;
  }

  // --- Serve static files ---
  const filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('Server running on port ' + PORT + ' (Luau API via embedded runtime)'));
`,
		extraFiles: {
			"main.luau": `-- main.luau - Your Luau logic lives here!
-- This script is executed by the Node.js server when /api/hello is called.
-- Whatever you print() becomes the API response.
-- Tip: print valid JSON to return structured data.

local response = {
    message = "Hello from Luau!",
    timestamp = os.clock(),
    info = "Edit main.luau to change this response"
}

-- Simple JSON encoder for flat tables
local function toJSON(t)
    local parts = {}
    for k, v in pairs(t) do
        local val = type(v) == "string" and ('"' .. v .. '"') or tostring(v)
        table.insert(parts, '"' .. k .. '":' .. val)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

print(toJSON(response))
`
		}
	},
	bash: {
		main: "main.sh",
		run: "bash main.sh",
		code: `#!/bin/bash
# Bash does not support HTTP servers natively.
# Your index.html will be served as a static file via the Web App feature.
# Add your Bash logic here.

echo "Hello from Bash!"
echo "To serve web content, edit index.html in this project."
`
	}
};

function generateTemplateFiles(toolId, language) {
	const toolDir = getToolDir(toolId);
	const tmpl = TEMPLATES[language] || TEMPLATES.node;
	fs.writeFileSync(path.join(toolDir, tmpl.main), tmpl.code, "utf-8");
	fs.writeFileSync(path.join(toolDir, "index.html"), TEMPLATE_HTML, "utf-8");
	if (tmpl.extraFiles) {
		for (const [name, content] of Object.entries(tmpl.extraFiles)) {
			fs.writeFileSync(path.join(toolDir, name), content, "utf-8");
		}
	}
	return tmpl.run;
}

module.exports = function registerToolingRoutes(app, deps) {
	const { db, views, escapeHtml, isAdmin, getCurrentUser } = deps;

	// Require login (admin or regular user) for all /admin/tooling routes
	function requireLogin(req, res) {
		if (!isAdmin(req) && !getCurrentUser(req)) {
			res.redirect("/login");
			return true;
		}
		return false;
	}

	function requireLoginJson(req, res) {
		if (!isAdmin(req) && !getCurrentUser(req)) {
			res.status(401).json({ error: "Login required" });
			return true;
		}
		return false;
	}

	// ── List all tools ──
	app.get("/admin/tooling", (req, res) => {
		if (requireLogin(req, res)) return;
		const msg = req.query.msg ? { text: req.query.msg, type: req.query.type || "success" } : null;

		db.all("SELECT * FROM tools ORDER BY updated_at DESC, created_at DESC", [], (err, tools) => {
			if (err) return res.status(500).send("Database error");
			tools = (tools || []).map(t => {
				t._status = runningProcesses.has(t.id) ? "running" : "";
				return t;
			});
			res.send(views.toolingListPage({ tools, msg }));
		});
	});

	// ── Create a new tool ──
	app.post("/admin/tooling", (req, res) => {
		if (requireLogin(req, res)) return;
		const name = (req.body.name || "").trim();
		if (!name) return res.redirect("/admin/tooling?msg=" + encodeURIComponent("Name is required") + "&type=error");

		const desc = (req.body.description || "").trim();
		const language = (req.body.language || "node").trim();
		const now = new Date().toISOString();
		const createdBy = req.currentUser || "admin";

		db.run(
			"INSERT INTO tools (name, description, code, secrets, run_command, language, webapp_enabled, created_by, created_at, updated_at) VALUES (?, ?, '', '{}', '', ?, 1, ?, ?, ?)",
			[name, desc || null, language, createdBy, now, now],
			function (err) {
				if (err) return res.redirect("/admin/tooling?msg=" + encodeURIComponent("Failed to create") + "&type=error");
				const toolId = this.lastID;
				const runCmd = generateTemplateFiles(toolId, language);
				db.run("UPDATE tools SET run_command = ? WHERE id = ?", [runCmd, toolId]);
				res.redirect("/admin/tooling/" + toolId);
			}
		);
	});

	// ── View/edit a tool ──
	app.get("/admin/tooling/:id", (req, res) => {
		if (requireLogin(req, res)) return;
		const id = req.params.id;
		const msg = req.query.msg ? { text: req.query.msg, type: req.query.type || "success" } : null;

		db.get("SELECT * FROM tools WHERE id = ?", [id], (err, tool) => {
			if (err || !tool) return res.status(404).send("Tool not found");

			// Auto-migrate: if tool has code in DB but no files on disk, create starter file
			const toolDir = getToolDir(tool.id);
			if (tool.code && tool.code.trim()) {
				const files = listFilesRecursive(toolDir);
				if (files.length === 0) {
					const lang = tool.language || "node";
					const extMap = { node: ".js", python: ".py", lua: ".luau", luau: ".luau", ruby: ".rb", bash: ".sh" };
					const ext = extMap[lang] || ".js";
					const mainFile = "main" + ext;
					fs.writeFileSync(path.join(toolDir, mainFile), tool.code, "utf-8");
					const cmdMap = { node: "node main.js", python: "python main.py", lua: "luau main.luau", luau: "luau main.luau", ruby: "ruby main.rb", bash: "bash main.sh" };
					const runCmd = cmdMap[lang] || "node main.js";
					db.run("UPDATE tools SET code = '', run_command = ? WHERE id = ?", [runCmd, tool.id]);
					tool.run_command = runCmd;
					tool.code = "";
				}
			}

			db.all("SELECT id, status, exit_code, started_at, finished_at, run_by FROM tool_runs WHERE tool_id = ? ORDER BY started_at DESC LIMIT 50", [id], (err2, runs) => {
				const runningStatus = runningProcesses.has(Number(id)) ? "running" : "";
				res.send(views.toolingEditorPage({ tool, runs: runs || [], msg, runningStatus }));
			});
		});
	});

	// ── Save settings (name, description, run command) ──
	app.post("/admin/tooling/:id/settings", (req, res) => {
		if (requireLogin(req, res)) return;
		const id = req.params.id;
		const name = (req.body.name || "").trim();
		const desc = (req.body.description || "").trim();
		const runCommand = (req.body.run_command || "").trim();
		const githubToken = (req.body.github_token || "").trim();
		const webappEnabled = req.body.webapp_enabled ? 1 : 0;
		const webappDir = (req.body.webapp_dir || "").trim().replace(/[\\\/]+$/, "");
		const webappPublic = req.body.webapp_public ? 1 : 0;
		if (!name) return res.redirect("/admin/tooling/" + id + "?msg=" + encodeURIComponent("Name is required") + "&type=error");

		const now = new Date().toISOString();
		db.run("UPDATE tools SET name = ?, description = ?, run_command = ?, github_token = ?, webapp_enabled = ?, webapp_dir = ?, webapp_public = ?, updated_at = ? WHERE id = ?",
			[name, desc || null, runCommand, githubToken, webappEnabled, webappDir, webappPublic, now, id], (err) => {
			if (err) return res.redirect("/admin/tooling/" + id + "?msg=" + encodeURIComponent("Failed to save") + "&type=error");
			res.redirect("/admin/tooling/" + id + "?msg=" + encodeURIComponent("Settings saved") + "&type=success");
		});
	});

	// ── Save secrets ──
	app.post("/admin/tooling/:id/secrets", (req, res) => {
		if (requireLogin(req, res)) return;
		const id = req.params.id;

		let keys = req.body.secret_key || [];
		let vals = req.body.secret_val || [];
		if (!Array.isArray(keys)) keys = [keys];
		if (!Array.isArray(vals)) vals = [vals];

		const secrets = {};
		for (let i = 0; i < keys.length; i++) {
			const k = (keys[i] || "").trim();
			if (k) secrets[k] = vals[i] || "";
		}

		const now = new Date().toISOString();
		db.run("UPDATE tools SET secrets = ?, updated_at = ? WHERE id = ?", [JSON.stringify(secrets), now, id], (err) => {
			if (err) return res.redirect("/admin/tooling/" + id + "?msg=" + encodeURIComponent("Failed to save secrets") + "&type=error");
			res.redirect("/admin/tooling/" + id + "?msg=" + encodeURIComponent("Secrets saved") + "&type=success");
		});
	});

	// ── Delete tool ──
	app.post("/admin/tooling/:id/delete", (req, res) => {
		if (requireLogin(req, res)) return;
		const id = req.params.id;

		killProcess(Number(id));

		// Remove project directory
		const toolDir = path.join(TOOLS_DIR, String(id));
		try { fs.rmSync(toolDir, { recursive: true, force: true }); } catch (e) {}

		db.run("DELETE FROM tool_runs WHERE tool_id = ?", [id], () => {
			db.run("DELETE FROM tools WHERE id = ?", [id], (err) => {
				if (err) return res.redirect("/admin/tooling?msg=" + encodeURIComponent("Failed to delete") + "&type=error");
				res.redirect("/admin/tooling?msg=" + encodeURIComponent("Tool deleted") + "&type=success");
			});
		});
	});

	// ── File management: list files ──
	app.get("/admin/tooling/:id/files", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolDir = getToolDir(Number(req.params.id));
		const files = listFilesRecursive(toolDir);
		res.json({ files });
	});

	// ── File management: read file ──
	app.get("/admin/tooling/:id/file", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const filePath = req.query.path;
		if (!filePath) return res.status(400).json({ error: "No path provided" });
		const toolDir = getToolDir(Number(req.params.id));
		const resolved = safeResolvePath(toolDir, filePath);
		if (!resolved) return res.status(400).json({ error: "Invalid path" });
		if (!fs.existsSync(resolved)) return res.status(404).json({ error: "File not found" });
		try {
			const content = fs.readFileSync(resolved, "utf-8");
			res.json({ content, path: filePath });
		} catch (e) {
			res.status(500).json({ error: "Failed to read file" });
		}
	});

	// ── File management: create/save file ──
	app.post("/admin/tooling/:id/file", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const filePath = (req.body.path || "").trim();
		const content = req.body.content != null ? req.body.content : "";
		if (!filePath) return res.status(400).json({ error: "No path provided" });
		const toolDir = getToolDir(Number(req.params.id));
		const resolved = safeResolvePath(toolDir, filePath);
		if (!resolved) return res.status(400).json({ error: "Invalid path" });
		try {
			const dir = path.dirname(resolved);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(resolved, content, "utf-8");
			res.json({ success: true });
		} catch (e) {
			res.status(500).json({ error: "Failed to save file" });
		}
	});

	// ── File management: delete file or folder ──
	app.post("/admin/tooling/:id/file/delete", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const filePath = (req.body.path || "").trim();
		if (!filePath) return res.status(400).json({ error: "No path provided" });
		const toolDir = getToolDir(Number(req.params.id));
		const resolved = safeResolvePath(toolDir, filePath);
		if (!resolved) return res.status(400).json({ error: "Invalid path" });
		if (!fs.existsSync(resolved)) return res.status(404).json({ error: "Not found" });
		try {
			const stat = fs.statSync(resolved);
			if (stat.isDirectory()) {
				fs.rmSync(resolved, { recursive: true, force: true });
			} else {
				fs.unlinkSync(resolved);
			}
			res.json({ success: true });
		} catch (e) {
			res.status(500).json({ error: "Failed to delete" });
		}
	});

	// ── File management: create directory ──
	app.post("/admin/tooling/:id/file/mkdir", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const dirPath = (req.body.path || "").trim();
		if (!dirPath) return res.status(400).json({ error: "No path provided" });
		const toolDir = getToolDir(Number(req.params.id));
		const resolved = safeResolvePath(toolDir, dirPath);
		if (!resolved) return res.status(400).json({ error: "Invalid path" });
		try {
			fs.mkdirSync(resolved, { recursive: true });
			res.json({ success: true });
		} catch (e) {
			res.status(500).json({ error: "Failed to create directory" });
		}
	});

	// ── Export project as ZIP ──
	app.get("/admin/tooling/:id/export", (req, res) => {
		if (requireLogin(req, res)) return;
		const toolId = Number(req.params.id);
		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).send("Tool not found");
			const toolDir = getToolDir(toolId);
			const safeName = (tool.name || "tool").replace(/[^a-zA-Z0-9_-]/g, "_");
			res.setHeader("Content-Type", "application/zip");
			res.setHeader("Content-Disposition", 'attachment; filename="' + safeName + '.zip"');
			const archive = archiver("zip", { zlib: { level: 6 } });
			archive.on("error", () => res.status(500).send("Failed to create zip"));
			archive.pipe(res);
			archive.directory(toolDir, false);
			archive.finalize();
		});
	});

	// ── Import project from ZIP ──
	const toolZipUpload = multer({
		storage: multer.diskStorage({
			destination: (req, file, cb) => cb(null, os.tmpdir()),
			filename: (req, file, cb) => cb(null, "toolimport-" + Date.now() + ".zip"),
		}),
		limits: { fileSize: 200 * 1024 * 1024 },
		fileFilter: (req, file, cb) => {
			const ext = path.extname(file.originalname || "").toLowerCase();
			cb(null, ext === ".zip");
		},
	});

	app.post("/admin/tooling/:id/import", toolZipUpload.single("toolZip"), (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);
		if (!req.file) return res.status(400).json({ error: "No zip file uploaded" });
		const zipPath = req.file.path;

		try {
			const toolDir = getToolDir(toolId);
			const zip = new AdmZip(zipPath);
			const entries = zip.getEntries();

			// Validate all entries stay within toolDir
			for (const entry of entries) {
				const resolved = path.resolve(toolDir, entry.entryName);
				if (!resolved.startsWith(toolDir + path.sep) && resolved !== toolDir) {
					fs.unlinkSync(zipPath);
					return res.status(400).json({ error: "Zip contains invalid paths" });
				}
			}

			zip.extractAllTo(toolDir, true);
			fs.unlinkSync(zipPath);
			res.json({ success: true, count: entries.length });
		} catch (e) {
			try { fs.unlinkSync(zipPath); } catch (_) {}
			res.status(500).json({ error: "Failed to extract zip: " + e.message });
		}
	});

	// ── Git clone/pull ──
	app.post("/admin/tooling/:id/git", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);
		const action = (req.body.action || "").trim();
		const url = (req.body.url || "").trim();

		if (runningProcesses.has(toolId)) {
			return res.json({ error: "A process is already running. Stop it first." });
		}

		const toolDir = getToolDir(toolId);
		let cmd;

		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).json({ error: "Tool not found" });

			const token = (tool.github_token || "").trim();

			if (action === "pull") {
				cmd = "git pull";
			} else if (url) {
				if (!/^https?:\/\/.+/i.test(url)) {
					return res.status(400).json({ error: "URL must start with http:// or https://" });
				}
				// Inject token for private repo auth
				let cloneUrl = url;
				if (token && /^https:\/\/github\.com\//i.test(url)) {
					cloneUrl = url.replace(/^https:\/\//i, "https://" + token + "@");
				}
				cmd = "git clone " + cloneUrl + " .";
			} else {
				return res.status(400).json({ error: "Provide a URL or action" });
			}

			// Set credential helper for pull with token
			if (token) {
				try {
					const gitConfigDir = path.join(toolDir, ".git");
					if (fs.existsSync(gitConfigDir)) {
						const { execSync } = require("child_process");
						execSync('git config credential.helper "!f() { echo password=' + token.replace(/'/g, '') + '; echo username=x-access-token; }; f"', { cwd: toolDir, timeout: 5000 });
					}
				} catch (e) { /* ignore config errors */ }
			}

			const now = new Date().toISOString();
			db.run(
				"INSERT INTO tool_runs (tool_id, status, output, started_at, run_by) VALUES (?, 'running', '', ?, ?)",
				[toolId, now, req.currentUser || "admin"],
				function (err2) {
					if (err2) return res.status(500).json({ error: "Failed to create run" });
					const runId = this.lastID;
					spawnToolProcess(toolId, runId, cmd, tool.secrets, toolDir);
					res.json({ success: true, run_id: runId });
				}
			);
		});
	});

	// ── Run a tool (execute run_command in project dir) ──
	app.post("/admin/tooling/:id/run", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);

		if (runningProcesses.has(toolId)) {
			return res.json({ error: "Tool is already running. Stop it first." });
		}

		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).json({ error: "Tool not found" });

			const runCommand = (tool.run_command || "").trim();
			if (!runCommand) return res.json({ error: "No run command configured. Set one in Settings." });

			const toolDir = getToolDir(toolId);
			const now = new Date().toISOString();
			db.run(
				"INSERT INTO tool_runs (tool_id, status, output, started_at, run_by) VALUES (?, 'running', '', ?, ?)",
				[toolId, now, req.currentUser || "admin"],
				function (err2) {
					if (err2) return res.status(500).json({ error: "Failed to create run" });
					const runId = this.lastID;
					spawnToolProcess(toolId, runId, runCommand, tool.secrets, toolDir);
					db.run("UPDATE tools SET last_run_at = ? WHERE id = ?", [now, toolId]);
					res.json({ success: true, run_id: runId });
				}
			);
		});
	});

	// ── Execute a shell command in tool's project dir ──
	app.post("/admin/tooling/:id/exec", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);
		const command = (req.body.command || "").trim();
		if (!command) return res.status(400).json({ error: "No command provided" });

		if (runningProcesses.has(toolId)) {
			return res.json({ error: "Tool is already running. Stop it first." });
		}

		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).json({ error: "Tool not found" });

			const toolDir = getToolDir(toolId);
			const now = new Date().toISOString();
			db.run(
				"INSERT INTO tool_runs (tool_id, status, output, started_at, run_by) VALUES (?, 'running', '', ?, ?)",
				[toolId, now, req.currentUser || "admin"],
				function (err2) {
					if (err2) return res.status(500).json({ error: "Failed to create run" });
					const runId = this.lastID;
					spawnToolProcess(toolId, runId, command, tool.secrets, toolDir);
					db.run("UPDATE tools SET last_run_at = ? WHERE id = ?", [now, toolId]);
					res.json({ success: true, run_id: runId });
				}
			);
		});
	});

	// ── Install a package (npm/pip/luarocks) ──
	app.post("/admin/tooling/:id/install-package", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);
		const ecosystem = (req.body.ecosystem || "npm").trim();
		const pkg = (req.body.package || "").trim();

		if (!pkg) return res.status(400).json({ error: "No package name provided" });
		if (!/^[@a-zA-Z0-9._\/-]+$/.test(pkg)) {
			return res.status(400).json({ error: "Invalid package name" });
		}

		if (runningProcesses.has(toolId)) {
			return res.json({ error: "A process is already running for this tool. Stop it first." });
		}

		let cmd;
		switch (ecosystem) {
			case "pip": cmd = "pip install " + pkg; break;
			case "luarocks": cmd = "luarocks install " + pkg; break;
			default: cmd = "npm install " + pkg; break;
		}

		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).json({ error: "Tool not found" });

			const toolDir = getToolDir(toolId);
			const now = new Date().toISOString();
			db.run(
				"INSERT INTO tool_runs (tool_id, status, output, started_at, run_by) VALUES (?, 'running', '', ?, ?)",
				[toolId, now, req.currentUser || "admin"],
				function (err2) {
					if (err2) return res.status(500).json({ error: "Failed to create run" });
					const runId = this.lastID;
					spawnToolProcess(toolId, runId, cmd, tool.secrets, toolDir);
					res.json({ success: true, run_id: runId });
				}
			);
		});
	});

	// ── Stop a running tool ──
	app.post("/admin/tooling/:id/stop", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const toolId = Number(req.params.id);

		if (!runningProcesses.has(toolId)) {
			return res.json({ message: "Tool is not running." });
		}

		killProcess(toolId);
		res.json({ message: "Stop signal sent." });
	});

	// ── Stream output for a run (polling endpoint) ──
	app.get("/admin/tooling/:id/runs/:runId/stream", (req, res) => {
		if (requireLoginJson(req, res)) return;
		const runId = req.params.runId;
		const offset = parseInt(req.query.offset, 10) || 0;

		db.get("SELECT output, status, exit_code FROM tool_runs WHERE id = ?", [runId], (err, run) => {
			if (err || !run) return res.status(404).json({ error: "Run not found" });
			const full = run.output || "";
			const chunk = full.substring(offset);
			res.json({
				chunk,
				offset: full.length,
				status: run.status,
				exit_code: run.exit_code,
			});
		});
	});

	// ── View a specific run's full output ──
	app.get("/admin/tooling/:id/runs/:runId", (req, res) => {
		if (requireLogin(req, res)) return;
		const toolId = req.params.id;
		const runId = req.params.runId;

		db.get("SELECT * FROM tools WHERE id = ?", [toolId], (err, tool) => {
			if (err || !tool) return res.status(404).send("Tool not found");

			db.get("SELECT * FROM tool_runs WHERE id = ? AND tool_id = ?", [runId, toolId], (err2, run) => {
				if (err2 || !run) return res.status(404).send("Run not found");
				res.send(views.toolRunOutputPage({ tool, run }));
			});
		});
	});

	// ── Helper: spawn a process (all commands run via shell in project dir) ──
	function spawnToolProcess(toolId, runId, command, secretsJson, toolDir) {
		let secrets = {};
		try { secrets = JSON.parse(secretsJson || "{}"); } catch (e) {}

		const binDir = path.join(process.cwd(), "bin");
		const pathSep = os.platform() === "win32" ? ";" : ":";
		const env = { ...process.env, ...secrets, PORT: String(getPort(toolId)), PATH: binDir + pathSep + (process.env.PATH || "") };
		const isWin = os.platform() === "win32";

		let proc;
		if (isWin) {
			proc = spawn("cmd.exe", ["/c", command], { env, cwd: toolDir });
		} else {
			proc = spawn("/bin/sh", ["-c", command], { env, cwd: toolDir });
		}

		runningProcesses.set(toolId, { proc, runId });

		let outputBuffer = "";
		const appendOutput = (chunk) => { outputBuffer += chunk; };

		proc.stdout.on("data", (data) => appendOutput(data.toString()));
		proc.stderr.on("data", (data) => appendOutput(data.toString()));

		const flushInterval = setInterval(() => {
			if (outputBuffer.length > 0) {
				const buf = outputBuffer;
				outputBuffer = "";
				db.run("UPDATE tool_runs SET output = output || ? WHERE id = ?", [buf, runId]);
			}
		}, 500);

		proc.on("exit", (code) => {
			clearInterval(flushInterval);
			const now = new Date().toISOString();
			const finalBuf = outputBuffer;
			outputBuffer = "";
			db.run("UPDATE tool_runs SET output = output || ?, status = 'finished', exit_code = ?, finished_at = ? WHERE id = ?",
				[finalBuf, code ?? 1, now, runId]);
			db.run("UPDATE tools SET last_exit_code = ? WHERE id = ?", [code ?? 1, toolId]);
			runningProcesses.delete(toolId);
		});

		proc.on("error", (err) => {
			clearInterval(flushInterval);
			const now = new Date().toISOString();
			db.run("UPDATE tool_runs SET output = output || ?, status = 'error', exit_code = -1, finished_at = ? WHERE id = ?",
				["\nProcess error: " + err.message + "\n", now, runId]);
			db.run("UPDATE tools SET last_exit_code = -1 WHERE id = ?", [toolId]);
			runningProcesses.delete(toolId);
		});
	}

	function killProcess(toolId) {
		const entry = runningProcesses.get(toolId);
		if (!entry) return;
		try {
			if (os.platform() === "win32") {
				spawn("taskkill", ["/pid", String(entry.proc.pid), "/f", "/t"]);
			} else {
				entry.proc.kill("SIGTERM");
			}
		} catch (e) {}
	}

	// ── Webapp: serve static files from a tool's project directory ──
	const MIME_TYPES = {
		".html": "text/html", ".htm": "text/html", ".css": "text/css",
		".js": "text/javascript", ".mjs": "text/javascript",
		".json": "application/json", ".xml": "application/xml",
		".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
		".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
		".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2",
		".ttf": "font/ttf", ".otf": "font/otf", ".eot": "application/vnd.ms-fontobject",
		".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg",
		".wav": "audio/wav", ".ogg": "audio/ogg", ".pdf": "application/pdf",
		".zip": "application/zip", ".wasm": "application/wasm",
		".txt": "text/plain", ".md": "text/plain", ".csv": "text/csv",
	};

	// Webapp: helper to serve a file from the tool's web root
	function serveWebappFile(req, res, toolName, reqPath) {
		db.get("SELECT * FROM tools WHERE name = ? AND webapp_enabled = 1", [toolName], (err, tool) => {
			if (err || !tool) return res.status(404).send("<!DOCTYPE html><html><body style=\"font-family:system-ui;text-align:center;padding:60px;\"><h2>404</h2><p>Web app not found.</p></body></html>");

			// If not public, require login
			if (!tool.webapp_public && !isAdmin(req) && !getCurrentUser(req)) {
				return res.redirect("/login");
			}

			const toolDir = getToolDir(tool.id);
			const port = getPort(tool.id);

			// If tool is running, proxy to its server
			if (runningProcesses.has(tool.id)) {
				const qs = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
				const targetPath = "/" + (reqPath || "") + qs;
				const proxyOpts = {
					hostname: "127.0.0.1",
					port: port,
					path: targetPath,
					method: req.method,
					headers: { ...req.headers, host: "127.0.0.1:" + port },
				};
				const proxyReq = http.request(proxyOpts, (proxyRes) => {
					res.writeHead(proxyRes.statusCode, proxyRes.headers);
					proxyRes.pipe(res);
				});
				proxyReq.on("error", () => {
					// Server not ready or crashed — fall back to static
					serveStaticFile(res, tool, toolDir, reqPath);
				});
				req.pipe(proxyReq);
				return;
			}

			// Not running — serve static files
			serveStaticFile(res, tool, toolDir, reqPath);
		});
	}

	function serveStaticFile(res, tool, toolDir, reqPath) {
		const webRoot = tool.webapp_dir ? path.join(toolDir, tool.webapp_dir) : toolDir;
		const resolvedWebRoot = path.resolve(webRoot);
		if (!resolvedWebRoot.startsWith(toolDir)) return res.status(403).send("Forbidden");

		let filePath = safeResolvePath(resolvedWebRoot, reqPath || "");
		if (!filePath) return res.status(400).send("Bad request");

		try {
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
		} catch (e) {}

		if (!fs.existsSync(filePath)) {
			const spaFallback = path.join(resolvedWebRoot, "index.html");
			if (fs.existsSync(spaFallback)) filePath = spaFallback;
			else return res.status(404).send("File not found");
		}

		const finalResolved = path.resolve(filePath);
		if (!finalResolved.startsWith(toolDir)) return res.status(403).send("Forbidden");

		const ext = path.extname(filePath).toLowerCase();
		const mime = MIME_TYPES[ext] || "application/octet-stream";
		res.setHeader("Content-Type", mime);
		fs.createReadStream(filePath).pipe(res);
	}

	app.get("/toolingapp/:name", (req, res) => serveWebappFile(req, res, req.params.name, ""));

	app.get("/toolingapp/:name/*path", (req, res) => {
		const p = Array.isArray(req.params.path) ? req.params.path.join("/") : (req.params.path || "");
		serveWebappFile(req, res, req.params.name, p);
	});
};
