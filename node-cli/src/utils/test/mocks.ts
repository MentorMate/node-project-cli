import { strings } from 'gluegun';
import getFeatures from '../commands/features';
import { MockToolbox, SampleExtensionInput } from './types';
import { AuthOption, Database, Framework, ProjectLanguage } from '../../@types';

export const createToolboxMock = (): MockToolbox => ({
  filesystem: {
    copy: jest.fn(),
    copyAsync: jest.fn(),
    dir: jest.fn(),
    exists: jest.fn(),
    path: jest.fn().mockImplementation((...args) => args.join('/')),
    read: jest.fn().mockReturnValue(JSON.stringify({})),
    write: jest.fn(),
    cwd: jest.fn().mockReturnValue('/path/to'),
    removeAsync: jest.fn(),
    writeAsync: jest.fn(),
  },
  parameters: {
    plugin: 'node-cli',
    command: 'generate',
    array: ['project-name'],
    options: {
      interactive: true,
    },
    raw: [
      '/path/to/node',
      '/path/to/app/bin/node-cli',
      'generate',
      'project-name',
    ],
    argv: [
      '/path/to/node',
      '/path/to/project/bin/node-cli',
      'generate',
      'project-name',
    ],
    first: 'project-name',
    second: undefined,
    third: undefined,
    string: 'project-name',
  },
  patching: {
    replace: (filename: string, oldContent: string, newContent: string) =>
      filename.replace(oldContent, newContent),
  },
  print: {
    success: jest.fn(),
    highlight: jest.fn(),
    error: jest.fn(),
    muted: jest.fn(),
    warning: jest.fn(),
  },
  prompt: {
    ask: jest.fn().mockImplementation(
      async (
        questions: {
          format: CallableFunction;
          result: () => string;
          name: string;
        }[],
      ) => {
        const answers = questions.map((q) => {
          const answer = [q.format, q.result]
            .filter(Boolean)
            .reduce((val, fn: CallableFunction) => fn(val), `${q.name}Answer`);
          return [q.name, answer];
        });
        return Object.fromEntries(answers);
      },
    ),
  },
  strings,
  system: {
    run: jest.fn().mockReturnValue(''),
    which: jest.fn().mockReturnValue(true),
  },
  meta: {
    src: '/path/to/project-name/src',
  },
  template: {
    generate: jest.fn().mockResolvedValue(''),
  },
  // Extensions
  os: {
    isWin: jest.fn().mockReturnValue(false),
  },
  createProjectDirectory: jest.fn(),
  initializeNpm: jest.fn(),
  initializeGit: jest.fn(),
  installExpress: jest.fn(),
  installNest: jest.fn(),
  jsLinters: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  jestConfig: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  auditConfig: jest.fn().mockReturnValue({
    asyncOperations: jest.fn(),
  }),
  setupTs: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  setupHusky: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  dockerizeWorkflow: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  setupJwt: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  setupPostgreSQL: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  generateReadme: jest.fn().mockReturnValue({
    asyncOperations: jest.fn(),
  }),
  debug: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  editorconfig: jest.fn().mockReturnValue({
    asyncOperations: jest.fn(),
  }),
  setupLicenseChecks: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
    asyncOperations: jest.fn(),
  }),
  setupMarkdownLinter: jest.fn().mockReturnValue({
    syncOperations: jest.fn(),
  }),
  commandHelp: {
    shouldPrint: jest.fn().mockReturnValue(false),
    print: jest.fn(),
  },
});

export const createExtensionInput = (): SampleExtensionInput => ({
  projectName: 'project-name',
  framework: Framework.EXPRESS,
  projectLanguage: ProjectLanguage.TS,
  authOption: AuthOption.JWT,
  appDir: '/path/to/project-name',
  assetsPath: '/path/to/project-name/assets',
  workflowsFolder: '/path/to/project-name/workflows',
  features: getFeatures(true),
  pkgJson: {
    scripts: {},
    dependencies: {},
    devDependencies: {},
  },
  envVars: {
    Node: {
      NODE_ENV: 'development',
    },
  },
  db: Database.NONE,
  isExampleApp: false,
});
