import '@extensions/zod/register';

import route from './register';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const tokens = { idToken: 'token' };
    const authService = { register: jest.fn(() => tokens) };
    const req = {
      body: { key: 'value' },
      services: { authService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call AuthService#register', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(authService.register).toHaveBeenCalledWith(req.body);
    });

    it('should respond with 200', () => {
      expect(status).toHaveBeenCalledWith(200);
    });

    it('should send the register response', () => {
      expect(send).toHaveBeenCalledWith(tokens);
    });
  });
});
