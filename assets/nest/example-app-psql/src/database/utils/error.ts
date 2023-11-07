import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';

export const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError &&
  e.code !== undefined &&
  e.constraint !== undefined;

export const isUniqueViolation = (constraint: string) => (e: unknown) =>
  isDatabaseError(e) &&
  e.code === PostgresError.UNIQUE_VIOLATION &&
  e.constraint === constraint;

export const isForeignKeyViolation = (constraint: string) => (e: unknown) =>
  isDatabaseError(e) &&
  e.code === PostgresError.FOREIGN_KEY_VIOLATION &&
  e.constraint === constraint;
