const extend = require('./install-nest');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('install-nest', () => {
  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installNest on toolbox', () => {
    const toolbox = {};
    extend(toolbox);
    expect(toolbox.installNest).toBeDefined();
  });

  describe('installNest', () => {
    const toolbox = createToolboxMock();

    beforeAll(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      extend(toolbox);
      toolbox.installNest(createExtensionInput());
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });
  });
});
