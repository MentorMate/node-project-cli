module.exports = {
  framework: 'express',
  projectLanguage: 'TS',
  db: 'pg',
  features: [
    'JSLinters',
    'huskyHooks',
    'commitMsgLint',
    'preCommit',
    'prePush',
    'dockerizeWorkflow',
  ]
}