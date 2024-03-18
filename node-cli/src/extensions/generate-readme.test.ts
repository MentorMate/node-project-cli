import extend from './generate-readme';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox, Operations } from 'src/utils/test/types';

describe('generate-readme', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set generateReadme on toolbox', () => {
    expect(toolbox.generateReadme).toBeDefined();
  });

  describe('generateReadme', () => {
    const input = createExtensionInput();
    let ops: Operations;

    beforeAll(() => {
      ops = toolbox.generateReadme(input);
    });

    it('should return asyncOperations when the extension is called', () => {
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.template.generate = jest.fn();
        await toolbox.generateReadme(input).asyncOperations();
      });

      it('should render the README template', () => {
        expect(toolbox.template.generate).toHaveBeenCalledWith({
          template: 'README.md.ejs',
          target: `${input.appDir}/README.md`,
          props: expect.anything(),
        });
      });
    });
  });
});
