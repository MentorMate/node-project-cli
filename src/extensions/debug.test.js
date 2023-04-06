const extend = require('./debug');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('debug-extension', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set debug on toolbox', () => {
    expect(toolbox.debug).toBeDefined();
  });

  describe('debug', () => {
    let input;
    let ops;

    beforeAll(() => {
      input = createExtensionInput();
    });

    beforeEach(() => {
      ops = toolbox.debug(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;

      beforeAll(() => {
        input.framework = 'nest';
      });

      beforeEach(() => {
        ops.syncOperations();
        scripts = input.pkgJson.scripts;
      });

      describe('when the framework is not nest', () => {
        beforeAll(() => {
          input.framework = 'express';
        });

        it('should add the start:debug script', () => {
          expect(scripts).toHaveProperty('start:debug');
        });
      });
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.debug(input).asyncOperations();
      });

      it('should copy the vscode folder', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/vscode/`,
          `${input.appDir}/.vscode/`
        );
      });
    });
  });
});
