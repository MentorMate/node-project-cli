import { ErrorMapping, mapError, rethrowError } from './error';

describe('mapError', () => {
  it('should return a function', () => {
    expect(mapError()).toBeInstanceOf(Function);
  });

  describe('the returned function', () => {
    const newError = new TypeError('type-error');

    const mapping: ErrorMapping = {
      isError(e) {
        return e instanceof Error && e.message === 'some-message';
      },
      newError() {
        return newError;
      },
    };

    it('should return the original error when no mapping matched it', () => {
      const error = new Error('message');
      expect(mapError(mapping)(error)).toBe(error);
    });

    it('should return the matched error when a mapping matched it', () => {
      const error = new Error('some-message');
      expect(mapError(mapping)(error)).toBe(newError);
    });
  });
});

describe('rethrowError', () => {
  it('should return a function', () => {
    expect(mapError()).toBeInstanceOf(Function);
  });

  describe('the returned function', () => {
    const mapping: ErrorMapping = {
      isError(e) {
        return e instanceof Error && e.message === 'some-message';
      },
      newError() {
        return new TypeError('type-error');
      },
    };

    it('should rethrow the original error when no mapping matched it', () => {
      const error = new Error('message');
      expect(() => rethrowError(mapping)(error)).toThrow(error);
    });

    it('should rethrow the matched error when a mapping matched it', () => {
      const error = new Error('some-message');
      expect(() => rethrowError(mapping)(error)).toThrow(
        new TypeError('type-error')
      );
    });
  });
});
