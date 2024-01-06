import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { RecordNotFoundError } from '../errors';
import { foreignKeyViolation } from './foreign-key-violation.error-mapping';

describe('foreignKeyViolation', () => {
  it('should return an error mapping', () => {
    expect(foreignKeyViolation('constraint-name', 'error-message')).toEqual({
      isError: expect.any(Function),
      newError: expect.any(Function),
    });
  });

  describe('isError', () => {
    const isError = foreignKeyViolation(
      'constraint-name',
      'error-message'
    ).isError;

    it('should return true when the error is a foreign key constraint violation error', () => {
      const error = new DatabaseError('error', 1, 'error');
      error.code = PostgresError.FOREIGN_KEY_VIOLATION;
      error.constraint = 'constraint-name';
      expect(isError(error)).toBe(true);
    });

    it('should return false when the error is not a foreign key constraint violation error', () => {
      expect(isError(new Error('error'))).toBe(false);
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
    });
  });

  describe('newError', () => {
    const newError = foreignKeyViolation(
      'constraint-name',
      'error-message'
    ).newError;

    it('should return an instance of RecordNotFound with the provided error message', () => {
      const error = newError();
      expect(error).toBeInstanceOf(RecordNotFoundError);
      expect(error.message).toBe('error-message');
    });
  });
});
