import { z, ZodType } from 'zod';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { DuplicateRecordException, RecordNotFoundException } from '@common';

export const first = <T>([record]: T[]) => record;

// These aliases are just for readability
type DatabaseErrorCode = Exclude<DatabaseError['code'], undefined>;
type DatabaseConstaintname = string;
type ErrorConstructor = () => Error;

const dbToServiceErrorMap: Record<
  DatabaseErrorCode,
  Record<DatabaseConstaintname, ErrorConstructor>
> = {
  [PostgresError.UNIQUE_VIOLATION]: {
    unq_todos_name: () =>
      new DuplicateRecordException('To-Do name already taken'),
    unq_users_email: () =>
      new DuplicateRecordException('User email already taken'),
  },

  [PostgresError.NO_DATA]: {
    todos_id: () => new RecordNotFoundException('To-Do not found'), // TODO: Check error contraint
    users_email: () => new RecordNotFoundException('User not found'), // TODO: Check error contraint
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

export const sortOrder = z.enum(['asc', 'desc']);

export type SortOrder = z.infer<typeof sortOrder>;

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}

export const pagination = z
  .object({
    page: z.coerce.number().int().positive(),
    items: z.coerce.number().int().positive(),
  })
  .partial();

const paginationMeta = pagination.required().extend({
  total: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof pagination>;
export type PaginationMeta = z.infer<typeof paginationMeta>;

export interface Paginated<Record> {
  data: Record[];
  meta: PaginationMeta;
}

export const paginated = <S extends ZodType<unknown>>(schema: S) =>
  z.object({
    data: z.array(schema),
    meta: paginationMeta,
  });

const paginationDefaults = {
  page: 1,
  items: 20,
};

export const extractPagination = (pagination?: Pagination) =>
  Object.assign({}, paginationDefaults, pagination);

export const parseCount = ([{ count }]: Array<{
  count?: string | number;
}>): number =>
  typeof count === 'string' ? parseInt(count) : (count as number);
