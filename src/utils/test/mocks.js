const { strings } = require('gluegun');

const createToolboxMock = () => ({
  filesystem: {
    copy: (from, to, options) => {},
    copyAsync: async (from, to, options) => {},
    dir: (path, criteria) => {},
    path: (...args) => '',
    read: (path) => JSON.stringify({}),
    write: (path, data, options) => {},
  },
  parameters: {
    plugin: 'node-cli',
    command: 'generate',
    array: [ 'project-name' ],
    options: {},
    raw: [
      '/path/to/node',
      '/path/to/project/bin/node-cli',
      'generate',
      'project-name',
    ],
    argv: [
      '/path/to/node',
      '/path/to/project/bin/node-cli',
      'generate',
      'project-name'
    ],
    first: 'project-name',
    second: undefined,
    third: undefined,
    string: 'project-name'
  },
  patching: {
    replace: (filename, oldContent, newContent) => filename.replace(oldContent, newContent),
  },
  print: {
    success: (msg) => {},
    error: (msg) => {},
    muted: (msg) => {},
  },
  prompt: {
    ask: async (questions) => {
      const answers = questions.map(q => {
        const answer = [q.format, q.result]
          .filter(Boolean)
          .reduce((val, fn) => fn(val), `${q.name}Answer`)
        return [q.name, answer];
      });
      return Object.fromEntries(answers);
    },
  },
  strings,
  system: {
    run: (cmd) => ''
  },
  meta: {
    src: '/path/to/project/src',
  },
  template: {
    generate: (opts) => '',
  },
  // Extensions
  installFramework: async () => {},
  installNest: async () => {},
  jsLinters: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  jestConfig: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  setupTs: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  setupHusky: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  dockerizeWorkflow: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
});

const createExtensionInput = () => ({
  projectName: 'project-name',
  projectScope: 'scope',
  framework: 'express',
  projectLanguage: 'TS',
  moduleType: 'CJS',
  appDir: '/path/to/app',
  assetsPath: '/path/to/app/assets',
  workflowsFolder: '/path/to/app/workflows',
  features: [
    'JSLinters',
    'huskyHooks',
    'commitMsgLint',
    'preCommit',
    'prePush',
    'dockerizeWorkflow'
  ],
  pkgJsonScripts: [],
  pkgJsonInstalls: [],
});

module.exports = {
  createToolboxMock,
  createExtensionInput,
};
