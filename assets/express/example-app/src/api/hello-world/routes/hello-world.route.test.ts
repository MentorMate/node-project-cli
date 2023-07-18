import { helloWorldRoute as route } from './hello-world.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    it('should respond with "Hello, World"', () => {
      const res = { send: jest.fn() };
      route.handler({} as never, res as never, jest.fn());
      expect(res.send).toHaveBeenCalledWith('Hello, World!');
    });
  });
});
