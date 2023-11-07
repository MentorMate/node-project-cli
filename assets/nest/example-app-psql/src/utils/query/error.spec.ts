import { RecordNotFoundError } from '@database/errors';
import { definedOrNotFound, updatedOrNotFound } from './error';

describe('definedOrNotFound', () => {
  it('should return a function', () => {
    expect(typeof definedOrNotFound('message')).toBe('function');
  });

  describe('returned function', () => {
    it('should return the value it is called with when the value is not undefined', () => {
      expect(definedOrNotFound('message')(null)).toBe(null);
      expect(definedOrNotFound('message')(false)).toBe(false);
      expect(definedOrNotFound('message')(0)).toBe(0);
      expect(definedOrNotFound('message')('')).toBe('');
      const emptyArray: unknown[] = [];
      expect(definedOrNotFound('message')(emptyArray)).toBe(emptyArray);
      const emptyObject = {};
      expect(definedOrNotFound('message')(emptyObject)).toEqual(emptyObject);
    });

    it('should throw RecordNotFound when the value it is called with is undefined', () => {
      expect(() => definedOrNotFound('message')(undefined)).toThrowError(
        new RecordNotFoundError('message'),
      );
    });
  });
});

describe('updatedOrNotFound', () => {
  it('should return a function', () => {
    expect(typeof updatedOrNotFound('message')).toBe('function');
  });

  describe('returned function', () => {
    it('should return the number it is called with when the number is not zero', () => {
      expect(updatedOrNotFound('message')(-1)).toBe(-1);
      expect(updatedOrNotFound('message')(1)).toBe(1);
      expect(updatedOrNotFound('message')(NaN)).toEqual(NaN);
    });

    it('should throw RecordNotFound when the value it is called with is zero', () => {
      expect(() => updatedOrNotFound('message')(0)).toThrowError(
        new RecordNotFoundError('message'),
      );
    });
  });
});
