import extend from './os';
import { createToolboxMock } from '../utils/test/mocks';
import { MockToolbox } from '../utils/test/types';

describe('os', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set os on toolbox', () => {
    expect(toolbox.os).toBeDefined();
  });

  it('should expose an isWin method', () => {
    expect(toolbox.os.isWin).toBeDefined();
  });

  describe('isWin', () => {
    it('should return boolean', () => {
      expect(typeof toolbox.os.isWin()).toBe('boolean');
    });
  });
});
