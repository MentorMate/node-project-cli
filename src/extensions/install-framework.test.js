const extend = require('./install-framework');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('install-framework', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installFramework on toolbox', () => {
    expect(toolbox.installFramework).toBeDefined();
  });

  describe('installFramework', () => {
    const input = createExtensionInput();
    let dependencies;

    beforeAll(() => {
      input.projectLanguage = 'JS';
    });

    beforeEach(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      toolbox.filesystem.dir = jest.fn(() => {});
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.installFramework(input);
      dependencies = input.pkgJson.dependencies;
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });

    it('should install add the framework to dependencies', () => {
      expect(dependencies).toHaveProperty(input.framework);
    });

    describe('when the language is TypeScript', () => {
      beforeAll(() => {
        input.projectLanguage = 'TS';
      });

      it('should copy the example project source', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/src/`,
          `${input.appDir}/src/`
        );
      });

      it('should copy the example project tests', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/test/`,
          `${input.appDir}/test/`
        );
      });
    });

    describe('when an error is thrown', () => {
      const error = new Error('the-error');

      beforeEach(() => {
        toolbox.filesystem.copyAsync = jest.fn(() => {
          throw error;
        });
      });

      it('should rethrow the error with an added user-friendly message', () => {
        expect(toolbox.installFramework(input)).rejects.toThrow(
          `An error has occurred while installing ${input.framework}: ${error}`
        );
      });
    });
  });
});
