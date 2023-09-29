import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { DuplicateRecordError } from '../errors';
import { uniqueViolation } from './unique-violation.error-mapping';

describe('uniqueViolation', () => {
  it('should return an error mapping', () => {
    expect(uniqueViolation('constraint-name', 'error-message')).toEqual({
      isError: expect.any(Function),
      newError: expect.any(Function),
    });
  });

  describe('isError', () => {
    const isError = uniqueViolation('constraint-name', 'error-message').isError;

    it('should return true when the error is a unique constraint violation error', () => {
      const error = new DatabaseError('error', 1, 'error');
      error.code = PostgresError.UNIQUE_VIOLATION;
      error.constraint = 'constraint-name';
      expect(isError(error)).toBe(true);
    });

    it('should return false when the error is not a unique constraint violation error', () => {
      expect(isError(new Error('error'))).toBe(false);
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
    });
  });

  describe('newError', () => {
    const newError = uniqueViolation(
      'constraint-name',
      'error-message',
    ).newError;

    it('should return an instance of DuplicateRecord with the provided error message', () => {
      const error = newError();
      expect(error).toBeInstanceOf(DuplicateRecordError);
      expect(error.message).toBe('error-message');
    });
  });
});
