const extend = require('./initialize-git');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('initialize-git', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set initializeGit on toolbox', () => {
    expect(toolbox.initializeGit).toBeDefined();
  });

  describe('initializeGit', () => {
    const input = createExtensionInput();

    beforeAll(() => {
      input.appDir = 'dir';
    });

    beforeEach(() => {
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      toolbox.print.muted = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.system.which = jest.fn(() => {});
    });

    describe('when git is not found', () => {
      beforeEach(() => {
        toolbox.system.which = jest.fn(() => undefined);
      });

      it('should throw an exception', () => {
        expect(toolbox.initializeGit(input)).rejects.toThrow(
          `Command 'git' not found.`
        );
      });
    });

    describe('when git is found', () => {
      beforeEach(() => {
        toolbox.system.which = jest.fn(() => '/usr/bin/git');
        toolbox.initializeGit(input);
      });

      it('should initialize git and create the main branch', () => {
        expect(toolbox.system.run).toHaveBeenCalledWith(
          `git init && git checkout -b main`,
          { cwd: input.appDir }
        );
      });

      it('should copy the .gitignore file over', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/git/gitignorefile`,
          `${input.appDir}/.gitignore`
        );
      });
    });
  });
});
