const handler = require('./hello-world');

describe('hello-world', () => {
  it('should return "Hello, World"!', () => {
    const res = { send: jest.fn() };
    handler({}, res);
    expect(res.send).toHaveBeenCalledWith('Hello, World!');
  });
});
