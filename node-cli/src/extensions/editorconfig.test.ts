import extend from './editorconfig';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox, Operations } from 'src/utils/test/types';

describe('editorconfig', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set editorconfig on toolbox', () => {
    expect(toolbox.editorconfig).toBeDefined();
  });

  describe('editorconfig', () => {
    let input = createExtensionInput();
    let ops: Operations;

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
          `${input.appDir}/.editorconfig`,
        );
      });
    });
  });
});
