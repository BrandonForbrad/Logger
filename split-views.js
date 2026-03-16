const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'src/views/index.js'), 'utf8');
const lines = src.split('\n');

// Helper to extract lines (1-indexed start, 1-indexed end inclusive)
function extract(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

// logs.js
fs.writeFileSync(path.join(__dirname, 'src/views/logs.js'),
  `const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');\n\n` +
  extract(546, 750) + '\n\n' +
  extract(751, 831) + '\n\n' +
  extract(2194, 2554) + '\n\n' +
  `module.exports = {\n  editLogPage,\n  logHistoryPage,\n  newLogPage,\n};\n`
);
console.log('logs.js created');

// admin.js
fs.writeFileSync(path.join(__dirname, 'src/views/admin.js'),
  `const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');\n\n` +
  extract(832, 938) + '\n\n' +
  extract(1865, 1929) + '\n\n' +
  extract(1930, 2067) + '\n\n' +
  extract(2068, 2129) + '\n\n' +
  extract(2779, 2877) + '\n\n' +
  extract(2878, 2991) + '\n\n' +
  extract(2992, 3027) + '\n\n' +
  extract(3028, 3065) + '\n\n' +
  `module.exports = {\n  adminPanelPage,\n  adminChangePasswordPage,\n  manageUsersPage,\n  legalHoldPage,\n  adminMissedHoursPage,\n  adminBackupsPage,\n  restoringBackupPage,\n  restoringUploadedBackupPage,\n};\n`
);
console.log('admin.js created');

// pinned.js
fs.writeFileSync(path.join(__dirname, 'src/views/pinned.js'),
  `const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');\n\n` +
  extract(939, 1247) + '\n\n' +
  extract(1248, 1443) + '\n\n' +
  extract(1444, 1730) + '\n\n' +
  extract(1731, 1864) + '\n\n' +
  `module.exports = {\n  pinnedNewPage,\n  pinnedHistoryPage,\n  pinnedEditPage,\n  pinnedDetailPage,\n};\n`
);
console.log('pinned.js created');

// uploader.js
fs.writeFileSync(path.join(__dirname, 'src/views/uploader.js'),
  extract(2555, 2778) + '\n\n' +
  `module.exports = {\n  uploaderPage,\n};\n`
);
console.log('uploader.js created');

// systems.js
fs.writeFileSync(path.join(__dirname, 'src/views/systems.js'),
  extract(3066, 3198) + '\n\n' +
  extract(3199, 5370) + '\n\n' +
  extract(5371, 7122) + '\n\n' +
  extract(7123, 7788) + '\n\n' +
  extract(7789, 8102) + '\n\n' +
  `module.exports = {\n  systemsBaseCss,\n  systemsListPage,\n  systemDetailPage,\n  taskDetailPage,\n  myTasksPage,\n  historyPage,\n};\n`
);
console.log('systems.js created');

// roadmaps.js
fs.writeFileSync(path.join(__dirname, 'src/views/roadmaps.js'),
  extract(8103, 10211) + '\n\n' +
  `module.exports = {\n  roadmapsListPage,\n  roadmapDetailPage,\n};\n`
);
console.log('roadmaps.js created');

console.log('All view files split successfully!');
