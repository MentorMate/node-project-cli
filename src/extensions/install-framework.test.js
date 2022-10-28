const extend = require('./install-framework');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('install-framework', () => {
  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installFramework on toolbox', () => {
    const toolbox = {};
    extend(toolbox);
    expect(toolbox.installFramework).toBeDefined();
  });

  describe('installFramework', () => {
    const toolbox = createToolboxMock();

    beforeAll(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      extend(toolbox);
      toolbox.installFramework(createExtensionInput());
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });
  });
});
