const extend = require('./initialize-npm');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('initialize-npm', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
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
