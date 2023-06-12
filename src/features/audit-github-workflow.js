module.exports = {
  meta: {
    id: 'audit-github-workflow',
    name: 'Audit GitHub Workflow',
  },
  output: () => ({
    assets: [
      {
        source: '.github/workflows/audit.yaml',
        target: '.github/workflows/audit.yaml',
      },
    ],
  }),
};
