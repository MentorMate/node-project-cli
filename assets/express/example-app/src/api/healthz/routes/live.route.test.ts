import route from './live.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    it('should respond with "OK"', () => {
      const res = { send: jest.fn() };
      route.handler({} as never, res as never, jest.fn());
      expect(res.send).toHaveBeenCalledWith('OK');
    });
  });
});
