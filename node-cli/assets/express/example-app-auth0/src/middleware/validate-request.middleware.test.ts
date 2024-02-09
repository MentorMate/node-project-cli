import z from 'zod';
import { UnprocessableEntity } from 'http-errors';
import { validateRequest } from './validate-request.middleware';

describe('validateJwt', () => {
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
