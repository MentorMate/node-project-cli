const extend = require('./js-linters-extension');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('js-linters-extension', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set jsLinters on toolbox', () => {
    expect(toolbox.jsLinters).toBeDefined();
  });

  describe('jsLinters', () => {
    const input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.jsLinters(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;
      let devDependencies;

      beforeAll(() => {
        input.projectLanguage = 'JS';
      });

      beforeEach(() => {
        toolbox.jsLinters(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add a format script', () => {
        expect(scripts['format']).toMatch(/prettier/);
      });

      describe('when the language is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS';
        });

        it('should add a lint script', () => {
          expect(scripts['lint']).toMatch(/eslint/);
        });

        it('should add the @typescript-eslint/eslint-plugin package', () => {
          expect(devDependencies).toHaveProperty(
            '@typescript-eslint/eslint-plugin'
          );
        });

        it('should add the @typescript-eslint/parser package', () => {
          expect(devDependencies).toHaveProperty('@typescript-eslint/parser');
        });
      });

      describe('when the language is JavaScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'JS';
        });

        it('should add a lint script', () => {
          expect(scripts['lint']).toMatch(/eslint/);
        });
      });

      it('should add the prettier package', () => {
        expect(devDependencies).toHaveProperty('prettier');
      });

      it('should add the eslint package', () => {
        expect(devDependencies).toHaveProperty('eslint');
      });

      it('should add the eslint-config-prettier package', () => {
        expect(devDependencies).toHaveProperty('eslint-config-prettier');
      });

      it('should add the markdownlint-cli package', () => {
        expect(devDependencies).toHaveProperty('markdownlint-cli');
      });
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.template.generate = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.jsLinters(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      it('should generate an eslint config', () => {
        expect(toolbox.template.generate).toHaveBeenCalled();
        const opts = toolbox.template.generate.mock.calls[0][0];
        expect(opts.template).toBe('eslintrc-model.js.ejs');
        expect(opts.target).toBe(`${input.appDir}/.eslintrc.js`);
      });

      it('should copy the .eslintignore file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.eslintignore`,
          `${input.appDir}/.eslintignore`
        );
      });

      it('should copy the prettier config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.prettierrc.js`,
          `${input.appDir}/.prettierrc.js`
        );
      });

      it('should copy the prettier ignore fire', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.prettierignore`,
          `${input.appDir}/.prettierignore`
        );
      });

      describe('when an error is thrown', () => {
        const error = new Error('the-error');

        beforeEach(() => {
          toolbox.template.generate = jest.fn(() => {
            throw error;
          });
        });

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.jsLinters(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while executing JS linters configuration: ${error}`
          );
        });
      });
    });
  });
});
