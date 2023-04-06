import handler from './hello-world';

describe('hello-world', () => {
  it('should return "Hello, World"!', () => {
    const res = { send: jest.fn() };
    handler({} as never, res as never, jest.fn());
    expect(res.send).toHaveBeenCalledWith('Hello, World!');
  });
});
