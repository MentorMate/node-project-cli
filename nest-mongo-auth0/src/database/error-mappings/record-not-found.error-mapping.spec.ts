import { RecordNotFoundError } from '@database/errors';
import { MongoError } from 'mongodb';
import { recordNotFoundErrorMapping } from './record-not-found.error-mapping';

describe('recordNotFound', () => {
  it('should return an error mapping', () => {
    expect(recordNotFoundErrorMapping('error-message')).toEqual({
      isError: expect.any(Function),
      newError: expect.any(Function),
    });
  });

  describe('isError', () => {
    const isError = recordNotFoundErrorMapping('error-message').isError;

    it('should return true when the error is a MongoDB error', () => {
      const error = new MongoError('error');
      error.code = 1;
      expect(isError(error)).toBe(true);
    });

    it('should return false when the error is not a MongoDB error', () => {
      expect(isError(new Error('error'))).toBe(false);
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
    });
  });

  describe('newError', () => {
    const newError = recordNotFoundErrorMapping('error-message').newError;

    it('should return an instance of RecordNotFound with the provided error message', () => {
      const error = newError();
      expect(error).toBeInstanceOf(RecordNotFoundError);
      expect(error.message).toBe('error-message');
    });
  });
});
