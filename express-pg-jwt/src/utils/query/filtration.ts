import { Knex } from 'knex';

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
