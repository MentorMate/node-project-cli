import { Knex } from 'knex';
import { Sort, SortOrder, Pagination, extractPagination } from './utils';

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
type Filter<QueryBuilder extends Knex.QueryBuilder, Value> = (
  qb: QueryBuilder,
  value: Value
) => QueryBuilder;

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
export type FilterMap<QueryBuilder extends Knex.QueryBuilder, Filters> = {
  // Since query params are usually optional,
  // we loop through the query params removing their optionality via `-?`,
  // then map them to a filter of their value excluding undefined.
  [K in keyof Filters]-?: Filter<QueryBuilder, Exclude<Filters[K], undefined>>;
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
type Sorter<QueryBuilder extends Knex.QueryBuilder> = (
  qb: QueryBuilder,
  order?: SortOrder
) => QueryBuilder;

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
  QueryBuilder extends Knex.QueryBuilder,
  SortColumn extends string
> = Record<SortColumn, Sorter<QueryBuilder>>;

export interface ListQuery<Filters, Sort, Pagination> {
  filters?: Filters;
  sorts?: Sort[];
  pagination?: Pagination;
}

//
// Knex extensions
//
export const filter = <
  QB extends Knex.QueryBuilder,
  Query extends Record<string, unknown>,
  Filters extends FilterMap<QB, Query>
>(
  qb: QB,
  filters: Query,
  filterMap: Filters
): QB =>
  Object.entries(filters)
    .filter(([, v]) => v !== undefined)
    .reduce<QB>(
      (qb, [k, v]) => filterMap[k as keyof Filters](qb, v as never),
      qb
    );

export const sort = <
  QB extends Knex.QueryBuilder,
  SortColumn extends string
>(
  qb: QB,
  sorts: Sort<SortColumn>[],
  sorterMap: SorterMap<QB, SortColumn>
): QB =>
  sorts.reduce<QB>((qb, sort) => sorterMap[sort.column](qb, sort.order), qb);

export const paginate = <QB extends Knex.QueryBuilder>(
  qb: QB,
  pagination?: Pagination
) => {
  const { page, items } = extractPagination(pagination);

  return qb.offset((page - 1) * items).limit(items);
};

export const list = <
  QB extends Knex.QueryBuilder,
  Filters,
  SortColumn extends string,
  FM extends FilterMap<Knex.QueryBuilder, Filters>,
  SM extends SorterMap<Knex.QueryBuilder, SortColumn>
>(
  qb: QB,
  query: ListQuery<Filters, Sort<SortColumn>, Pagination>,
  { filterMap, sorterMap }: { filterMap: FM; sorterMap: SM }
): QB =>
  qb
    .filter(query.filters, filterMap)
    .sort(query.sorts, sorterMap)
    .paginate(query.pagination);
