import '@extensions/zod/register';

import createHttpError from 'http-errors';
import route from './login';

describe('route', () => {
  it('should be defined', () => {
    expect(route).toBeDefined();
  });

  describe('handler', () => {
    const tokens = { idToken: 'token' };
    const authService = { login: jest.fn(() => tokens) };
    const req = {
      body: { key: 'value' },
      services: { authService },
    };
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { send, status };

    it('should call AuthService#login', () => {
      route.handler(req as never, res as never, jest.fn());
      expect(authService.login).toHaveBeenCalledWith(req.body);
    });

    describe('when login is successful', () => {
      const send = jest.fn();
      const status = jest.fn(() => ({ send }));
      const res = { send, status };

      beforeAll(() => {
        route.handler(req as never, res as never, jest.fn());
      });

      it('should respond with 200', () => {
        expect(status).toHaveBeenCalledWith(200);
      });

      it('should send the login response', () => {
        expect(send).toHaveBeenCalledWith(tokens);
      });
    });

    describe('when login failed', () => {
      const authService = { login: jest.fn(() => undefined) };
      const req = {
        body: { key: 'value' },
        services: { authService },
      };
      const send = jest.fn();
      const status = jest.fn(() => ({ send }));
      const res = { send, status };
      const next = jest.fn();

      beforeAll(async () => {
        await route.handler(req as never, res as never, next);
      });

      it('should throw an error', () => {
        expect(next).toHaveBeenCalledWith(
          expect.any(createHttpError.UnprocessableEntity)
        );
      });

      it('should not respond', () => {
        expect(status).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
      });
    });
  });
});
