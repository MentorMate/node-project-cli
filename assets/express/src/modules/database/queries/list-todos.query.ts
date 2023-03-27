import { z, ZodEnum } from 'zod';
import { Knex as KnexType } from 'knex';

import { Tables } from 'knex/types/tables';
import { FilterMap, SorterMap } from '../knex-extensions';
import { sortOrder, pagination } from '@common/query';

// TODO: cleanup the whole file

const listTodosFilters = z.object({
  name: z.string().optional(),
  completed: z.boolean().optional(),
});

type ListTodosFilters = z.infer<typeof listTodosFilters>;

export const listTodosFilterMap: FilterMap<
  KnexType.QueryBuilder<Tables['todos']>,
  ListTodosFilters
> = {
  name: (qb, name) => qb.whereILike('name', `%${name}%`),
  completed: (qb, completed) => qb.where('completed', completed),
};

const listTodosSortColumn = z.enum(['name', 'createdAt']);

const sorts = <S extends ZodEnum<[string, ...string[]]>>(schema: S) =>
  z.array(
    z.object({
      column: schema,
      order: sortOrder.optional(),
    })
  );
const listTodosSorts = sorts(listTodosSortColumn);

export type ListTodosSortColumn = z.infer<typeof listTodosSortColumn>;

const listTodosSorterMap: SorterMap<
  KnexType.QueryBuilder<Tables['todos']>,
  ListTodosSortColumn
> = {
  name: (qb, order) => qb.orderBy('name', order),
  createdAt: (qb, order) => qb.orderBy('createdAt', order),
};

export const listTodosMaps = {
  filterMap: listTodosFilterMap,
  sorterMap: listTodosSorterMap,
};

export const listTodosQuery = z.object({
  filters: listTodosFilters.optional(),
  sorts: listTodosSorts.optional(),
  pagination: pagination.optional(),
});

export type ListTodosQuery = z.infer<typeof listTodosQuery>;
