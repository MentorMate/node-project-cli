import { z, ZodEnum } from 'zod';
import { FilterMap, SorterMap } from '@database';
import { Knex as KnexType } from 'knex';
import { Tables } from 'knex/types/tables';
import { sortOrder, pagination } from '../../utils';

//
// List To-Dos inputs
//
const listUsersFilters = z.object({
  email: z.coerce.string().optional(),
});

type ListUsersFilters = z.infer<typeof listUsersFilters>;

export const listUsersFilterMap: FilterMap<
  KnexType.QueryBuilder<Tables['users']>,
  ListUsersFilters
> = {
  email: (qb, email) => qb.where({ email }),
};

const listUsersSortColumn = z.enum(['email', 'createdAt']);
const sorts = <S extends ZodEnum<[string, ...string[]]>>(schema: S) =>
  z.array(
    z.object({
      column: schema,
      order: sortOrder.optional(),
    })
  );
const listUsersSorts = sorts(listUsersSortColumn);

export type ListUsersSortColumn = z.infer<typeof listUsersSortColumn>;

const listUsresSorterMap: SorterMap<
  KnexType.QueryBuilder<Tables['users']>,
  ListUsersSortColumn
> = {
  email: (qb, order) => qb.orderBy('email', order),
  createdAt: (qb, order) => qb.orderBy('createdAt', order),
};

export const listUsersMaps = {
  filterMap: listUsersFilterMap,
  sorterMap: listUsresSorterMap,
};

export const listUsersQuery = z.object({
  filters: listUsersFilters.optional(),
  sorts: listUsersSorts.optional(),
  pagination: pagination.optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuery>;
