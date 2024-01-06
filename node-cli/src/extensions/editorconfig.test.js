const extend = require('./editorconfig');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('editorconfig', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set editorconfig on toolbox', () => {
    expect(toolbox.editorconfig).toBeDefined();
  });

  describe('editorconfig', () => {
    let input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.editorconfig(input);
    });

    it('should return asyncOperations when the extension is called', () => {
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.editorconfig(input).asyncOperations();
      });

      it('should copy the .editorconfig file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.editorconfig`,
          `${input.appDir}/.editorconfig`
        );
      });
    });
  });
});
