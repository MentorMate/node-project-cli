const extend = require('./audit-workflow');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('audit-workflow', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set auditConfig on toolbox', () => {
    expect(toolbox.auditConfig).toBeDefined();
  });

  describe('auditConfig', () => {
    let input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.auditConfig(input);
    });

    it('should return asyncOperations when the extension is called', () => {
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.auditConfig(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      it('should copy the audit workflow config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.github/workflows/audit.yaml`,
          `${input.workflowsFolder}/audit.yaml`
        );
      });
    });

    describe('when an error is thrown', () => {
      const error = new Error('error');

      beforeEach(async () => {
        toolbox.filesystem.copyAsync = jest.fn(() => {
          throw error;
        });
      });

      it('should rethrow the error with an added user-friendly message', () => {
        expect(toolbox.auditConfig(input).asyncOperations()).rejects.toThrow(
          `An error has occurred while copying audit workflow: ${error}`
        );
      });
    });
  });
});
