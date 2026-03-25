// Re-export all views from per-page modules
const auth = require('./auth');
const policy = require('./policy');
const logs = require('./logs');
const admin = require('./admin');
const pinned = require('./pinned');
const uploader = require('./uploader');
const systems = require('./systems');
const roadmaps = require('./roadmaps');
const profile = require('./profile');
const logDumps = require('./logDumps');
const apiKeys = require('./apiKeys');
const tooling = require('./tooling');

module.exports = {
  ...auth,
  ...policy,
  ...logs,
  ...admin,
  ...pinned,
  ...uploader,
  ...systems,
  ...roadmaps,
  ...profile,
  ...logDumps,
  ...apiKeys,
  ...tooling,
};
