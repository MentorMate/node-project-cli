import extend from './initialize-npm';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox } from '../utils/test/types';

describe('initialize-npm', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set initializeNpm on toolbox', () => {
    expect(toolbox.initializeNpm).toBeDefined();
  });

  describe('initializeNpm', () => {
    const input = createExtensionInput();

    beforeAll(() => {
      input.appDir = 'dir';
    });

    beforeEach(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.initializeNpm(input);
    });

    it('should initialize NPM', () => {
      expect(toolbox.system.run).toHaveBeenCalledWith(`npm init -y`, {
        cwd: input.appDir,
      });
    });
  });
});
