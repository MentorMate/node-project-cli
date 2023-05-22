type IsErrorPredicate = (error: unknown) => boolean;

type ErrorFactory = () => Error;

export interface ErrorMapping {
  isError: IsErrorPredicate;
  newError: ErrorFactory;
}

export const mapError = function (...mappings: ErrorMapping[]) {
  return function (err: Error) {
    for (const { isError, newError } of mappings) {
      if (isError(err)) {
        return newError();
      }
    }

    return err;
  };
};

export const rethrowError = function (...mappings: ErrorMapping[]) {
  const errorMapper = mapError(...mappings);

  return function (err: Error) {
    throw errorMapper(err);
  };
};
