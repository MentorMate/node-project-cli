const extend = require('./dockerize-workflow');
const { createToolboxMock, createExtensionInput } = require('../utils/test/mocks');

describe('dockerize-workflow', () => {
  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set dockerizeWorkflow on toolbox', () => {
    const toolbox = {};
    extend(toolbox);
    expect(toolbox.dockerizeWorkflow).toBeDefined();
  });

  describe('dockerizeWorkflow', () => {
    const toolbox = createToolboxMock();

    beforeAll(() => {
      extend(toolbox);
    });

    it('should return asyncOperations when the extension is called', () => {
      expect(toolbox.dockerizeWorkflow(createExtensionInput()).asyncOperations).toBeDefined();
    });

    describe('asyncOperations', () => {
      const toolbox = createToolboxMock();

      beforeAll(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        extend(toolbox);
        await toolbox.dockerizeWorkflow(createExtensionInput()).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });
    });
  });
});
