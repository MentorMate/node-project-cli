const { strings } = require('gluegun');
const generate = require('./generate');

const userInput = {
  projectName: 'project-name',
  projectScope: 'scope',
  framework: 'express',
  projectLanguage: 'TS',
  moduleType: 'CJS',
  features: [
    'JSLinters',
    'huskyHooks',
    'commitMsgLint',
    'preCommit',
    'prePush',
    'dockerizeWorkflow'
  ]
};

const toolbox = {
  filesystem: {
    copyAsync: async (from, to, options) => {},
    dir: (path, criteria) => {},
    path: (...args) => '',
    read: (path) => JSON.stringify({ scripts: {}, jest: {} }),
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
  print: {
    success: (msg) => {},
    error: (msg) => {},
    muted: (msg) => {},
  },
  prompt: {
    ask: jest.fn(async (questions) => {
      const answers = questions.map(q => {
        const answer = [q.format, q.result]
          .filter(Boolean)
          .reduce((val, fn) => fn(val), userInput[q.name])
        return [q.name, answer];
      });
      return Object.fromEntries(answers);
    }),
  },
  strings,
  system: {
    run: (cmd) => ''
  },
  meta: {
    src: '/path/to/project/src',
  },
  // Extensions
  installFramework: async () => {},
  installNest: async () => {},
  jsLinters: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  jestConfig: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  setupTs: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  setupHusky: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
  dockerizeWorkflow: () => ({ syncOperations: () => {}, asyncOperations: async () => {} }),
};

describe('generate', () => {
  it('should be defined', () => {
    expect(generate).toBeDefined();
    expect(generate.name).toBeDefined();
    expect(generate.description).toBeDefined();
    expect(generate.alias).toBeDefined();
    expect(generate.run).toBeDefined();
  });

  describe('run', () => {
    beforeAll(async () => {
      await generate.run(toolbox);
    });

    it('should prompt the user twice', () => {
      expect(toolbox.prompt.ask).toHaveBeenCalledTimes(2);
    });

    it('should ask for the project name, scope and framework', async () => {
      const questions = toolbox.prompt.ask.mock.calls[0][0];

      expect(questions).toHaveLength(3);
      expect(questions[0].name).toBe('projectName');
      expect(questions[1].name).toBe('projectScope');
      expect(questions[2].name).toBe('framework');

      const answers = await toolbox.prompt.ask.mock.results[0].value;
      expect(answers).toEqual({
        projectName: 'project-name',
        projectScope: 'scope',
        framework: 'express'
      });
    });

    it('should ask for the project language, module system and app features', async () => {
      const questions = toolbox.prompt.ask.mock.calls[1][0];

      expect(questions).toHaveLength(3);
      expect(questions[0].name).toBe('projectLanguage');
      expect(questions[1].name).toBe('moduleType');
      expect(questions[2].name).toBe('features');

      const answers = await toolbox.prompt.ask.mock.results[1].value;
      expect(answers).toEqual({
        projectLanguage: 'TS',
        moduleType: 'CJS',
        features: [
          'JSLinters',
          'huskyHooks',
          'commitMsgLint',
          'preCommit',
          'prePush',
          'dockerizeWorkflow'
        ]
      });
    });
  });
});
