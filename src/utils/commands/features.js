const dockerization = require('../../features/dockerization');
const licenseChecks = require('../../features/license-checks');
const markdownLint = require('../../features/markdown-lint');

module.exports = [
  'JSLinters',
  'huskyHooks',
  'commitMsgLint',
  'preCommit',
  'prePush',
  dockerization.meta.id,
  licenseChecks.meta.id,
  markdownLint.meta.id,
];
