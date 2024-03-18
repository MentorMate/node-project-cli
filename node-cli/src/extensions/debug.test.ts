import extend from './debug';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import {
  MockToolbox,
  Operations,
  SampleExtensionInput,
} from '../utils/test/types';
import { Framework } from '../@types';

describe('debug-extension', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set debug on toolbox', () => {
    expect(toolbox.debug).toBeDefined();
  });

  describe('debug', () => {
    let input: SampleExtensionInput;
    let ops: Operations;

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
      let scripts: Record<string, string>;

      beforeAll(() => {
        input.framework = Framework.NEST;
      });

      beforeEach(() => {
        ops.syncOperations();
        scripts = input.pkgJson.scripts;
      });

      describe('when the framework is not nest', () => {
        beforeAll(() => {
          input.framework = Framework.EXPRESS;
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
          `${input.appDir}/.vscode/`,
        );
      });
    });
  });
});
