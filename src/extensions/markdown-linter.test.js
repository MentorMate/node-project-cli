const extend = require('./markdown-linter');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('markdown-linter', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupMarkdownLinter on toolbox', () => {
    expect(toolbox.setupMarkdownLinter).toBeDefined();
  });

  describe('setupMarkdownLinter', () => {
    const input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.setupMarkdownLinter(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;
      let devDependencies;

      beforeEach(() => {
        toolbox.setupMarkdownLinter(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add a lint:markdown script', () => {
        expect(scripts).toHaveProperty('lint:markdown');
      });

      it('should add the markdownlint-cli package', () => {
        expect(devDependencies).toHaveProperty('markdownlint-cli');
      });
    });
  });
});
