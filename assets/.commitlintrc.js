module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'chore',
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'revert',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', ['sentence-case']],
  },
  parserPreset: {
    parserOpts: {
      referenceActions: null,
      issuePrefixes: ['AB#'],
    },
  },
};
