module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {},
  parserPreset: {
    parserOpts: {
      referenceActions: null,
      issuePrefixes: ['AB#'],
    },
  },
};
