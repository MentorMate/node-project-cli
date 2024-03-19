import { registerRoute as route } from './register.route';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const authService = { register: jest.fn(() => ({ user: 'user' })) };
    const req = {
      auth: { payload: { sub: '1' } },

      body: { name: 'Name' },
      services: { authService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call AuthService#register', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(authService.register).toHaveBeenCalledWith({ name: 'Name' });
    });
  });
});
