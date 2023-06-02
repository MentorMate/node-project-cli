/* eslint no-unused-vars: 0 */

const { strings } = require('gluegun');
const features = require('../commands/features');

const createToolboxMock = () => ({
  filesystem: {
    copy: (from, to, options) => {},
    copyAsync: async (from, to, options) => {},
    dir: (path, criteria) => {},
    exists: (path) => false,
    path: (...args) => args.join('/'),
    read: (path) => JSON.stringify({}),
    write: (path, data, options) => {},
    cwd: () => '/path/to',
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
    replace: (filename, oldContent, newContent) =>
      filename.replace(oldContent, newContent),
  },
  print: {
    success: (msg) => {},
    highlight: (msg) => {},
    error: (msg) => {},
    muted: (msg) => {},
    warning: (msg) => {},
  },
  prompt: {
    ask: async (questions) => {
      const answers = questions.map((q) => {
        const answer = [q.format, q.result]
          .filter(Boolean)
          .reduce((val, fn) => fn(val), `${q.name}Answer`);
        return [q.name, answer];
      });
      return Object.fromEntries(answers);
    },
  },
  strings,
  system: {
    run: (cmd) => '',
    which: () => true,
  },
  meta: {
    src: '/path/to/project-name/src',
  },
  template: {
    generate: (opts) => Promise.resolve(''),
  },
  // Extensions
  os: {
    isWin: () => false,
  },
  createProjectDirectory: async () => {},
  initializeNpm: async () => {},
  initializeGit: async () => {},
  installFramework: async () => {},
  installNest: async () => {},
  jsLinters: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  jestConfig: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  auditConfig: () => ({
    asyncOperations: async () => {},
  }),
  setupTs: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  setupHusky: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  dockerizeWorkflow: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  setupJwt: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  setupPostgreSQL: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  generateReadme: () => ({
    asyncOperations: async () => {},
  }),
  debug: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  editorconfig: () => ({
    asyncOperations: async () => {},
  }),
  setupLicenseChecks: () => ({
    syncOperations: () => {},
    asyncOperations: async () => {},
  }),
  setupMarkdownLinter: () => ({
    syncOperations: () => {},
  }),
  commandHelp: {
    shouldPrint: () => false,
    print: () => {},
  },
});

const createExtensionInput = () => ({
  projectName: 'project-name',
  projectScope: 'scope',
  framework: 'express',
  projectLanguage: 'TS',
  appDir: '/path/to/project-name',
  assetsPath: '/path/to/project-name/assets',
  workflowsFolder: '/path/to/project-name/workflows',
  features: features,
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
  db: 'none',
  isExampleApp: false,
});

module.exports = {
  createToolboxMock,
  createExtensionInput,
};
