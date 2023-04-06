import { ErrorMapping, mapErrors } from './utils';

describe('mapErrors', () => {
  it('should return a function', () => {
    expect(mapErrors()).toBeInstanceOf(Function);
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
      expect(() => mapErrors(mapping)(error)).toThrowError(error);
    });

    it('should rethrow the matched error when a mapping matched it', () => {
      const error = new Error('some-message');
      expect(() => mapErrors(mapping)(error)).toThrowError(
        new TypeError('type-error')
      );
    });
  });
});
