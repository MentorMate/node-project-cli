import { Knex } from 'knex';
import { Sort, SortOrder, Pagination } from '@common/query';
import { extractPagination } from '../utils';

/**
 * A Filter is a function that accepts a QueryBuilder for a given entity and a value,
 * applies the filter to the QueryBuilder and returns it.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type FilterByName = Filter<Knex.QueryBuilder<Tables['todos']>, Todo['name']>;
 *
 * const filterByName: FilterByName = (qb, name) => qb.where({ name });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Filter<Model extends {}, Value> = (
  qb: Knex.QueryBuilder<Model>,
  value: Value
) => Knex.QueryBuilder<Model>;

/**
 * A FilerMap is a map is a mapping from query param names to filters.
 * The type requires that the list of keys is exhaustive, in order to
 * enforce that all query parameters have a corresponding filter implemented.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * // This would typically be obtained via z.infer<typeof listTodosFiltersSchema>
 * interface ListTodosFilters {
 *   id?: number;
 *   name?: string;
 * };
 *
 * const listTodosFilterMap: FilterMap<Knex.QueryBuilder<Tables['todos']>, ListTodosFilters> = {
 *   id: (qb, id) => qb.where({ id }),
 *   name: (qb, name) => qb.whereILike('name', `%${name}%`),
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type FilterMap<Model extends {}, Filters> = {
  // Since query params are usually optional,
  // we loop through the query params removing their optionality via `-?`,
  // then map them to a filter of their value excluding undefined.
  [K in keyof Filters]-?: Filter<Model, Exclude<Filters[K], undefined>>;
};

/**
 * A Sorter is a function that accepts a QueryBuilder for a given entity and a sort order,
 * applies the sorting to the QueryBuilder and returns it.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type SortByName = Sorter<Knex.QueryBuilder<Tables['todos']>>;
 *
 * const sortByName: SortByName = (qb, order) => qb.orderBy('name', order);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Sorter<Model extends {}> = (
  qb: Knex.QueryBuilder<Model>,
  order?: SortOrder
) => Knex.QueryBuilder<Model>;

/**
 * A SorterMap is a map is a mapping from query param names to sorters.
 * The type requires that the list of keys is exhaustive, in order to
 * enforce that all sort parameters have a corresponding sorter implemented.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type ListTodoSortColumn = 'name' | 'createdAt';
 *
 * const listTodosSorterMap: SorterMap<Knex.QueryBuilder<Tables['todos']>, ListTodoSortColumn> = {
 *   name: (qb, order) => qb.orderBy('name', order),
 *   createdAt: (qb, order) => qb.orderBy('createdAt', order),
 * };
 * ```
 */
export type SorterMap<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model extends {},
  SortColumn extends string
> = Record<SortColumn, Sorter<Model>>;

export interface ListQuery<Filters, Sort, Pagination> {
  filters?: Filters;
  sorts?: Sort[];
  pagination?: Pagination;
}

//
// Knex extensions
//
export const filter = <
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model extends {},
  Query extends Record<string, unknown>,
  Filters extends FilterMap<Model, Query>
>(
  qb: Knex.QueryBuilder<Model>,
  filters: Query,
  filterMap: Filters
): Knex.QueryBuilder<Model> =>
  Object.entries(filters)
    .filter(([, v]) => v !== undefined)
    .reduce<Knex.QueryBuilder<Model>>(
      (qb, [k, v]) => filterMap[k as keyof Filters](qb, v as never),
      qb
    );

// eslint-disable-next-line @typescript-eslint/ban-types
export const sort = <Model extends {}, SortColumn extends string>(
  qb: Knex.QueryBuilder<Model>,
  sorts: Sort<SortColumn>[],
  sorterMap: SorterMap<Model, SortColumn>
): Knex.QueryBuilder<Model> =>
  sorts.reduce<Knex.QueryBuilder<Model>>(
    (qb, sort) => sorterMap[sort.column](qb, sort.order || 'asc'),
    qb
  );

export const paginate = <QB extends Knex.QueryBuilder>(
  qb: QB,
  pagination?: Pagination
) => {
  const { page, items } = extractPagination(pagination);

  return qb.offset((page - 1) * items).limit(items);
};
