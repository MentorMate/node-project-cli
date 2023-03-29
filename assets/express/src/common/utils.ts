export type IsNullable<T, K> = null extends T ? K : never;

export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];

/** `Partial` just for the nullable keys */
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>;

export type IsErrorPredicate = (error: unknown) => boolean;

export type ErrorFactory = () => Error;

export interface ErrorMapping {
  isError: IsErrorPredicate;
  newError: ErrorFactory;
}

export const mapErrors = function (...mappings: ErrorMapping[]) {
  return function (err: Error) {
    for (const { isError, newError } of mappings) {
      if (isError(err)) {
        throw newError();
      }
    }

    throw err;
  };
};
