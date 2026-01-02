const { spawn } = require("child_process");

function restartSelf() {
	const nodePath = process.argv[0];
	const scriptPath = process.argv[1];

	try {
		const child = spawn(nodePath, [scriptPath], {
			detached: true,
			stdio: "inherit",
		});
		child.unref();
	} catch (e) {
		console.error("Failed to spawn new process:", e);
	}

	process.exit(0);
}

module.exports = {
	restartSelf,
};
