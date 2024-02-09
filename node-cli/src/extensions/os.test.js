const extend = require('./os');
const { createToolboxMock } = require('../utils/test/mocks');

describe('os', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
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
