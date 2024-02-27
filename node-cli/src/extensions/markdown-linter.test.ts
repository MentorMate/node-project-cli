import extend from './markdown-linter';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox, Operations } from '../utils/test/types';

describe('markdown-linter', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupMarkdownLinter on toolbox', () => {
    expect(toolbox.setupMarkdownLinter).toBeDefined();
  });

  describe('setupMarkdownLinter', () => {
    const input = createExtensionInput();
    let ops: Operations;

    beforeEach(() => {
      ops = toolbox.setupMarkdownLinter(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts: Record<string, string>;
      let devDependencies: Record<string, string>;

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
