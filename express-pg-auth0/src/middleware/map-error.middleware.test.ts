import { DuplicateRecordError, RecordNotFoundError } from '@database/errors';
import { mapError } from './map-error.middleware';

describe('mapError', () => {
  it('should return an error handling middleware', () => {
    const middleware = mapError({});
    expect(middleware).toBeInstanceOf(Function);
    expect(middleware.length).toBe(4);
  });

  describe('middleware', () => {
    it('should pass the error to next when no mapping for it is provided', () => {
      const middleware = mapError({});
      const error = new Error();
      const next = jest.fn();
      middleware(error, {} as never, {} as never, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should map the error and pass it to next when a mapping is provided', () => {
      const middleware = mapError({
        [RecordNotFoundError.name]: DuplicateRecordError,
      });
      const error = new RecordNotFoundError('message');
      const next = jest.fn();
      middleware(error, {} as never, {} as never, next);
      expect(next).toHaveBeenCalledWith(
        new DuplicateRecordError(new RecordNotFoundError('message').message)
      );
    });
  });
});
