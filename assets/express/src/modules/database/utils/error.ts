import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import {
  DuplicateRecordException,
  RecordNotFoundException,
} from '@common/error';

// These aliases are just for readability
type DatabaseErrorCode = Exclude<DatabaseError['code'], undefined>;
type DatabaseConstraintName = string;
type ErrorConstructor = () => Error;

const dbToServiceErrorMap: Record<
  DatabaseErrorCode,
  Record<DatabaseConstraintName, ErrorConstructor>
> = {
  [PostgresError.UNIQUE_VIOLATION]: {
    unq_users_email: () =>
      new DuplicateRecordException('User email already taken'),
  },

  // To-Dos don't hold a `userId`, this is just an example
  [PostgresError.FOREIGN_KEY_VIOLATION]: {
    fk_todos_user_id: () => new RecordNotFoundException('User not found'),
  },
};

export const handleDbError = (e: unknown) => {
  if (
    !(e instanceof DatabaseError) ||
    e.code === undefined ||
    e.constraint === undefined
  ) {
    throw e;
  }

  const constructor = dbToServiceErrorMap[e.code]?.[e.constraint];

  if (constructor) {
    throw constructor();
  }

  throw e;
};
