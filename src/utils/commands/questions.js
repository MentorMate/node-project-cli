const getFeatureChoices = (isPip3Available) => [
  { message: 'JS Code Linters', value: 'JSLinters' },
  ...(isPip3Available
    ? [
        {
          message: 'Hooks with `husky`',
          value: 'huskyHooks',
          choices: [
            { message: 'Commit message linting', value: 'commitMsgLint' },
            { message: 'Pre-commit hook', value: 'preCommit' },
            { message: 'Pre-push hook', value: 'prePush' },
          ],
        },
      ]
    : []),
  {
    message: 'Containerization with Docker',
    value: 'dockerizeWorkflow',
  },
  {
    message: 'Dependency License Checks',
    value: 'licenseChecks',
  },
  { message: 'Markdown Linter', value: 'markdownLinter' },
];

const getInitialFeatureChoices = (isPip3Available) =>
  isPip3Available ? [0, 1, 5, 6, 7] : [0, 1, 2, 3];

const getQuestions = ({ projectName, framework }, isPip3Available) => [
  {
    type: 'input',
    name: 'projectName',
    message: 'Specify a project name:',
    initial: projectName,
    format: (v) => v.replace(/\s/g, '-'),
    result: (v) => v.replace(/\s/g, '-'),
  },
  {
    type: 'select',
    name: 'framework',
    message: 'Pick a framework for your project',
    choices: [
      { message: 'Express', value: 'express' },
      {
        message: 'NestJS (TS only) with pre-installed linters',
        value: 'nest',
      },
    ],
    initial: framework,
    result(v) {
      return v;
    },
  },
  {
    type: 'select',
    name: 'projectLanguage',
    message:
      'TypeScript should be selected unless there is a sufficient reason not to use it in your project.\n  Please contact the responsible architect on the project for approving Vanilla JS usage',
    choices: [
      { message: 'TypeScript', value: 'TS' },
      { message: 'JavaScript', value: 'JS' },
    ],
    skip: framework === 'nest',
  },
  {
    type: 'multiselect',
    name: 'features',
    message: 'Select the features you want to be prebuilt',
    choices: getFeatureChoices(isPip3Available),
    initial: getInitialFeatureChoices(isPip3Available),
  },
  {
    type: 'select',
    name: 'db',
    message: 'Select a database',
    choices: [
      { message: 'None', value: 'none' },
      { message: 'PostgreSQL', value: 'pg' },
    ],
  },
];

module.exports = {
  getFeatureChoices,
  getInitialFeatureChoices,
  getQuestions,
};
