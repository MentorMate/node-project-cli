import z from 'zod';
import {
  attachServices,
  logRequest,
  validateAccessToken,
  validateRequest,
} from './request';
import { UnprocessableEntity } from 'http-errors';

describe('attachServices', () => {
  it('should assign the services to the request', () => {
    const services = {};
    const req = {};
    const next = jest.fn();

    const middleware = attachServices(services as never);
    middleware(req as never, {} as never, next);

    expect((req as { services: typeof services }).services).toBe(services);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateAccessToken', () => {
  it('should return an instance of the express-jwt middleware', () => {
    const middleware = validateAccessToken('my-secret');
    expect(middleware.name).toBe('middleware');
    expect(middleware.unless).toBeDefined();
  });
});

describe('validateRequest', () => {
  describe('when the input is valid', () => {
    const req = { body: { name: 'John', age: 42 } };
    const next = jest.fn();
    const schema = {
      body: z.object({ name: z.string() }),
    };
    const middleware = validateRequest(schema);

    beforeAll(() => {
      middleware(req as never, {} as never, next);
    });

    it('should assign the validated input to the request', () => {
      expect(req.body).toEqual({ name: 'John' });
    });

    it('should call next', () => {
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when the input is not vaid', () => {
    const req = { body: { name: 42 } };
    const next = jest.fn();
    const schema = {
      body: z.object({ name: z.string() }),
    };
    const middleware = validateRequest(schema);

    beforeAll(() => {
      middleware(req as never, {} as never, next);
    });

    it('should call next with the validation error', () => {
      expect(next).toHaveBeenCalledWith(expect.any(UnprocessableEntity));
    });
  });
});

describe('logRequest', () => {
  it('should log the request method and url', () => {
    const logger = { info: jest.fn() };
    const req = { method: 'GET', url: '/todos' };
    const next = jest.fn();

    logRequest(logger as never)(req as never, {} as never, next);

    expect(logger.info).toHaveBeenCalledWith('GET /todos');
    expect(next).toHaveBeenCalled();
  });
});
