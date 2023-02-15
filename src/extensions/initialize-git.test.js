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
      toolbox.print.muted = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.initializeGit(input);
    });

    it('should initialize git and create the main branch', () => {
      expect(toolbox.system.run).toHaveBeenCalledWith(
        `git init && git checkout -b main`,
        { cwd: input.appDir }
      );
    });
  });
});
