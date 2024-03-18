import extend from './create-project-directory';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox } from 'src/utils/test/types';

describe('create-project-directory', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set initializeProject on toolbox', () => {
    expect(toolbox.createProjectDirectory).toBeDefined();
  });

  describe('createProjectDirectory', () => {
    const input = createExtensionInput();

    beforeAll(() => {
      input.appDir = 'dir';
    });

    beforeEach(() => {
      toolbox.filesystem.dir = jest.fn(() => {});
      toolbox.filesystem.exists = jest.fn(() => false);
      toolbox.print.muted = jest.fn(() => {});
      toolbox.createProjectDirectory(input);
    });

    it('should check if the directory exists', () => {
      expect(toolbox.filesystem.exists).toHaveBeenCalledWith(input.appDir);
    });

    it('should create the app directory', () => {
      expect(toolbox.filesystem.dir).toHaveBeenCalledWith(input.appDir);
    });

    describe('when the directory already exists', () => {
      beforeEach(() => {
        toolbox.filesystem.exists = jest.fn(() => true);
      });

      it('should throw an error', () => {
        expect(toolbox.createProjectDirectory(input)).rejects.toThrow(
          `Directory already exists: ${input.appDir}`,
        );
      });
    });
  });
});
