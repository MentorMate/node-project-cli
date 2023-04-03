import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { DuplicateRecord, RecordNotFound } from '../errors';
import {
  definedOrNotFound,
  foreignKeyViolation,
  uniqueViolation,
  updatedOrNotFound,
} from './error';

describe('definedOrNotFound', () => {
  it('should return a function', () => {
    expect(typeof definedOrNotFound('message')).toBe('function');
  });

  describe('returned function', () => {
    it('should return the value it is called with when the value is not undefined', () => {
      expect(definedOrNotFound()(null)).toBe(null);
      expect(definedOrNotFound()(false)).toBe(false);
      expect(definedOrNotFound()(0)).toBe(0);
      expect(definedOrNotFound()('')).toBe('');
      const emptyArray: unknown[] = [];
      expect(definedOrNotFound()(emptyArray)).toBe(emptyArray);
      const emptyObject = {};
      expect(definedOrNotFound()(emptyObject)).toEqual(emptyObject);
    });

    it('should throw RecordNotFound when the value it is called with is undefined', () => {
      expect(() => definedOrNotFound('message')(undefined)).toThrowError(
        new RecordNotFound('message')
      );
    });
  });
});

describe('updatedOrNotFound', () => {
  it('should return a function', () => {
    expect(typeof updatedOrNotFound()).toBe('function');
  });

  describe('returned function', () => {
    it('should return the number it is called with when the number is not zero', () => {
      expect(updatedOrNotFound()(-1)).toBe(-1);
      expect(updatedOrNotFound()(1)).toBe(1);
      expect(updatedOrNotFound()(NaN)).toEqual(NaN);
    });

    it('should throw RecordNotFound when the value it is called with is zero', () => {
      expect(() => updatedOrNotFound('message')(0)).toThrowError(
        new RecordNotFound('message')
      );
    });
  });
});

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
      'error-message'
    ).newError;

    it('should return an instance of DuplicateRecord with the provided error message', () => {
      const error = newError();
      expect(error).toBeInstanceOf(DuplicateRecord);
      expect(error.message).toBe('error-message');
    });
  });
});

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
      expect(error).toBeInstanceOf(RecordNotFound);
      expect(error.message).toBe('error-message');
    });
  });
});
