import { RecordNotFoundError } from '@database/errors';

const definedOrThrow = <T>(errorFactory: () => Error) => {
  return (result: T | null): T => {
    if (result === null) {
      throw errorFactory();
    }
    return result;
  };
};

const updatedOrThrow = (errorFactory: () => Error) => {
  return (result: number): number => {
    if (result === 0) {
      throw errorFactory();
    }
    return result;
  };
};

export const definedOrNotFound = <T>(message: string) =>
  definedOrThrow<T>(() => new RecordNotFoundError(message));

export const updatedOrNotFound = (message: string) =>
  updatedOrThrow(() => new RecordNotFoundError(message));
