import {
  UserInput,
  AuthOption,
  Database,
  Framework,
  ProjectLanguage,
} from '../../@types';

const getFeatureChoices = (isPip3Available: boolean) => [
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

const getInitialFeatureChoices = (isPip3Available: boolean) =>
  isPip3Available ? [0, 1, 5, 6, 7] : [0, 1, 2, 3];

export const selectFrameworkPrompt = (framework?: Framework) => [
  {
    type: 'select',
    name: 'framework',
    message: 'Pick a framework for your project',
    choices: [
      { message: 'Express', value: Framework.EXPRESS },
      {
        message: 'NestJS (TS only) with pre-installed linters',
        value: Framework.NEST,
      },
    ],
    initial: framework,
  },
];

export const selectAuthPrompt = (isExampleApp?: boolean) => [
  {
    type: 'select',
    name: 'authOption',
    message: 'Select authentication option',
    choices: [
      { message: 'JWT', value: AuthOption.JWT },
      { message: 'Auth0', value: AuthOption.AUTH0 },
    ],
    skip: !isExampleApp,
  },
];

export const selectDbPrompt = (
  framework?: Framework,
  isExampleApp?: boolean,
) => [
  {
    type: 'select',
    name: 'db',
    message: 'Select a database',
    choices: [
      !isExampleApp && { message: 'None', value: Database.NONE },
      { message: 'PostgreSQL', value: Database.POSTGRESQL },
      { message: 'MongoDB', value: Database.MONGODB },
    ].filter(Boolean),
    skip: isExampleApp && framework !== Framework.NEST,
  },
];

export const getQuestions = (
  { projectName, framework, isExampleApp }: Partial<UserInput>,
  isPip3Available: boolean,
) => [
  {
    type: 'input',
    name: 'projectName',
    message: 'Specify a project name:',
    initial: projectName,
    format: (v: string) => v.replace(/\s/g, '-'),
    result: (v: string) => v.replace(/\s/g, '-'),
  },
  ...selectFrameworkPrompt(framework),
  ...selectAuthPrompt(isExampleApp),
  {
    type: 'select',
    name: 'projectLanguage',
    message:
      'TypeScript should be selected unless there is a sufficient reason not to use it in your project.\n  Please contact the responsible architect on the project for approving Vanilla JS usage',
    choices: [
      { message: 'TypeScript', value: ProjectLanguage.TS },
      { message: 'JavaScript', value: ProjectLanguage.JS },
    ],
    skip: isExampleApp || framework === Framework.NEST,
  },
  selectDbPrompt(framework, isExampleApp),
  {
    type: 'multiselect',
    name: 'features',
    message: 'Select the features you want to be prebuilt',
    choices: getFeatureChoices(isPip3Available),
    initial: getInitialFeatureChoices(isPip3Available),
  },
];
