const extend = require('./js-linters-extension');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('js-linters-extension', () => {
  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set jsLinters on toolbox', () => {
    const toolbox = {};
    extend(toolbox);
    expect(toolbox.jsLinters).toBeDefined();
  });

  describe('jsLinters', () => {
    const toolbox = createToolboxMock();

    beforeAll(() => {
      extend(toolbox);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      const ops = toolbox.jsLinters(createExtensionInput());
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      const toolbox = createToolboxMock();
      const input = createExtensionInput();

      beforeAll(() => {
        extend(toolbox);
        toolbox.jsLinters(input).syncOperations();
      });

      it('should add npm packages and scripts', () => {
        expect(input.pkgJsonInstalls.length).toBeGreaterThan(0);
        expect(input.pkgJsonScripts.length).toBeGreaterThan(0);
      });
    });

    describe('asyncOperations', () => {
      let toolbox = createToolboxMock();

      beforeAll(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        extend(toolbox);
        await toolbox.jsLinters(createExtensionInput()).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });
    });
  });
});
