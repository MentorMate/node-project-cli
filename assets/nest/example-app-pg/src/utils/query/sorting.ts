import { Knex } from 'knex';

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}

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
export type Sorter<Model extends {}, SortColumn extends string> = (
  qb: Knex.QueryBuilder<Model>,
  order: SortOrder,
  column: SortColumn,
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
  SortColumn extends string,
> = Record<SortColumn, Sorter<Model, SortColumn>>;
