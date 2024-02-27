import generate from './generate';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';

describe('generate', () => {
  it('should be defined', () => {
    expect(generate).toBeDefined();
    expect(generate.name).toBeDefined();
    expect(generate.description).toBeDefined();
    expect(generate.alias).toBeDefined();
    expect(generate.run).toBeDefined();
  });

  describe('no pip3 run', () => {
    const toolbox = createToolboxMock();

    beforeAll(async () => {
      toolbox.system.which.mockReturnValue(false);
      await generate.run(toolbox as any);
    });

    it('should log a warning for not having pip3', () => {
      expect(toolbox.print.warning).toHaveBeenCalled();
    });
  });

  describe('when --interactive and --example-app flags are provided at the same time', () => {
    const toolbox = createToolboxMock();

    beforeAll(async () => {
      toolbox.parameters.options = {
        interactive: true,
        'example-app': true,
      };

      await generate.run(toolbox as any);
    });

    it('should log an error and stop the process', () => {
      expect(toolbox.print.error).toHaveBeenCalled();
    });
  });

  describe('normal run', () => {
    const userInput = createExtensionInput();
    const toolbox = createToolboxMock();

    describe('when --interactive flag is provided', () => {
      beforeAll(async () => {
        toolbox.prompt.ask.mockClear();
        toolbox.prompt.ask.mockImplementation(
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
                .reduce(
                  (val, fn: CallableFunction) => fn(val),
                  userInput[q.name as never],
                );
              return [q.name, answer];
            });
            return Object.fromEntries(answers);
          },
        );
        await generate.run(toolbox as any);
      });

      it('should prompt the user twice', () => {
        expect(toolbox.prompt.ask as any).toHaveBeenCalledTimes(2);
      });

      it('should ask for the project name and framework', async () => {
        const questions = toolbox.prompt.ask.mock.calls[0][0];

        expect(questions).toHaveLength(2);
        expect(questions[0].name).toBe('projectName');
        expect(questions[1].name).toBe('framework');

        const answers = await toolbox.prompt.ask.mock.results[0].value;
        const { projectName, framework } = userInput;
        const expectedAnswers = { projectName, framework };
        expect(answers).toEqual(expectedAnswers);
      });

      it('should ask for the project language and app features', async () => {
        const questions = toolbox.prompt.ask.mock.calls[1][0];

        expect(questions).toHaveLength(4);
        expect(questions[0].name).toBe('authOption');
        expect(questions[1].name).toBe('projectLanguage');
        expect(questions[2].name).toBe('db');
        expect(questions[3].name).toBe('features');

        const answers = await toolbox.prompt.ask.mock.results[1].value;
        const { projectLanguage, features, db } = userInput;
        const expectedAnswers = { projectLanguage, features, db };
        expect(answers).toEqual(expectedAnswers);
      });

      it('should produce a .env.example file', () => {
        expect(toolbox.template.generate).toHaveBeenCalledWith({
          template: 'dotenv/.env.example.ejs',
          target: `${userInput.appDir}/.env.example`,
          props: { groups: userInput.envVars },
        });
      });
    });
  });
});
