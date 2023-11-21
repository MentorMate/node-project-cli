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

const getQuestions = (
  { projectName, framework, isExampleApp },
  isPip3Available,
) => {
  const databaseQuestion = {
    type: 'select',
    name: 'db',
    message: 'Select a database',
    choices: [
      !isExampleApp && { message: 'None', value: 'none' },
      { message: 'PostgreSQL', value: 'pg' },
      { message: 'MongoDB', value: 'mongodb' },
    ].filter(Boolean),
  };

  return [
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
        if (v === 'express') {
          databaseQuestion.type = '';
        }
        return v;
      },
    },
    {
      type: 'select',
      name: 'authOption',
      message: 'Select authentication option',
      choices: [
        { message: 'JWT', value: 'jwt' },
        { message: 'Auth0', value: 'auth0' },
      ],
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
      skip: isExampleApp || framework === 'nest',
    },
    databaseQuestion,
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select the features you want to be prebuilt',
      choices: getFeatureChoices(isPip3Available),
      initial: getInitialFeatureChoices(isPip3Available),
    },
  ];
};

module.exports = {
  getFeatureChoices,
  getInitialFeatureChoices,
  getQuestions,
};
