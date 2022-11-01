const extend = require('./husky-setup-extension');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('husky-setup-extension', () => {
  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupHusky on toolbox', () => {
    const toolbox = {};
    extend(toolbox);
    expect(toolbox.setupHusky).toBeDefined();
  });

  describe('setupHusky', () => {
    const toolbox = createToolboxMock();

    beforeAll(() => {
      extend(toolbox);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      const ops = toolbox.setupHusky(createExtensionInput());
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      const toolbox = createToolboxMock();
      const input = createExtensionInput();

      beforeAll(() => {
        extend(toolbox);
        toolbox.setupHusky(input).syncOperations();
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
        await toolbox.setupHusky(createExtensionInput()).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });
    });
  });
});
