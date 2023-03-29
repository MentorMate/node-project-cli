import { ErrorMapping } from '@common/utils';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { DuplicateRecord, RecordNotFound } from '../errors';

const definedOrThrow = <T>(errorFactory: () => Error) => {
  return (result: T | undefined): T => {
    if (!result) {
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

export const definedOrNotFound = <T>(message?: string) =>
  definedOrThrow<T>(() => new RecordNotFound(message));

export const updatedOrNotFound = (message?: string) =>
  updatedOrThrow(() => new RecordNotFound(message));

const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError &&
  e.code !== undefined &&
  e.constraint !== undefined;

const isUniqueViolation = (constraint: string) => (e: unknown) =>
  isDatabaseError(e) &&
  e.code === PostgresError.UNIQUE_VIOLATION &&
  e.constraint === constraint;

const isForeignKeyViolation = (constraint: string) => (e: unknown) =>
  isDatabaseError(e) &&
  e.code === PostgresError.FOREIGN_KEY_VIOLATION &&
  e.constraint === constraint;

export const uniqueViolation = (
  constraint: string,
  message: string
): ErrorMapping => ({
  isError: isUniqueViolation(constraint),
  newError: () => new DuplicateRecord(message),
});

export const foreignKeyViolation = (
  constraint: string,
  message: string
): ErrorMapping => ({
  isError: isForeignKeyViolation(constraint),
  newError: () => new RecordNotFound(message),
});
