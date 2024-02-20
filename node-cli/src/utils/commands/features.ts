export default (isPip3Avaialble: boolean) => [
  'JSLinters',
  ...(isPip3Avaialble
    ? ['huskyHooks', 'commitMsgLint', 'preCommit', 'prePush']
    : []),
  'dockerizeWorkflow',
  'licenseChecks',
  'markdownLinter',
];
