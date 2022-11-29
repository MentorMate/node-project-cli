const generate = require('./generate');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('generate', () => {
  const userInput = createExtensionInput();
  const toolbox = createToolboxMock();

  it('should be defined', () => {
    expect(generate).toBeDefined();
    expect(generate.name).toBeDefined();
    expect(generate.description).toBeDefined();
    expect(generate.alias).toBeDefined();
    expect(generate.run).toBeDefined();
  });

  describe('no pip3 run', () => {
    beforeAll(async () => {
      toolbox.system.which = () => false;
      await generate.run(toolbox);
    });

    it('should log a warning for not having pip3', () => {
      expect(toolbox.print.warning.toHaveBeenCalled)
    })
  })

  describe('normal run', () => {
    beforeAll(async () => {
     toolbox.prompt.ask = jest.fn(async (questions) => {
      const answers = questions.map(q => {
        const answer = [q.format, q.result]
          .filter(Boolean)
          .reduce((val, fn) => fn(val), userInput[q.name])
        return [q.name, answer];
      });
      return Object.fromEntries(answers);
    });;
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
      const { projectName, projectScope, framework } = userInput;
      const expectedAnswers = { projectName, projectScope, framework };
      expect(answers).toEqual(expectedAnswers);
    });

    it('should ask for the project language, module system and app features', async () => {
      const questions = toolbox.prompt.ask.mock.calls[1][0];

      expect(questions).toHaveLength(3);
      expect(questions[0].name).toBe('projectLanguage');
      expect(questions[1].name).toBe('moduleType');
      expect(questions[2].name).toBe('features');

      const answers = await toolbox.prompt.ask.mock.results[1].value;
      const { projectLanguage, moduleType, features } = userInput;
      const expectedAnswers = { projectLanguage, moduleType, features };
      expect(answers).toEqual(expectedAnswers);
    });
  });
});
