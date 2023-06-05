module.exports = (isPip3Avaialble) => [
  'JSLinters',
  ...(isPip3Avaialble
    ? ['huskyHooks', 'commitMsgLint', 'preCommit', 'prePush']
    : []),
  'dockerizeWorkflow',
  'licenseChecks',
  'markdownLinter',
];
