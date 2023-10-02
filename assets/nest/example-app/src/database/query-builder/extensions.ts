import { Knex } from 'knex';
import {
  Sort,
  Pagination,
  FilterMap,
  SorterMap,
  extractPagination,
  SortOrder,
} from '@utils/query';

//
// Knex.QueryBuilder extensions
//
export const filter = <
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model extends {},
  Query extends Record<string, unknown>,
  Filters extends FilterMap<Model, Partial<Model>>,
>(
  qb: Knex.QueryBuilder<Model>,
  filters: Query,
  filterMap: Filters,
): Knex.QueryBuilder<Model> =>
  Object.entries(filters)
    .filter(([, v]) => v !== undefined)
    .reduce<Knex.QueryBuilder<Model>>(
      (qb, [k, v]) => filterMap[k as keyof Filters](qb, v as never, k as never),
      qb,
    );

// eslint-disable-next-line @typescript-eslint/ban-types
export const sort = <Model extends {}, SortColumn extends string>(
  qb: Knex.QueryBuilder<Model>,
  sorts: Sort<SortColumn>[],
  sorterMap: SorterMap<Model, SortColumn>,
): Knex.QueryBuilder<Model> =>
  sorts.reduce<Knex.QueryBuilder<Model>>(
    (qb, sort) =>
      sorterMap[sort.column](qb, sort.order || SortOrder.Asc, sort.column),
    qb,
  );

export const paginate = <QB extends Knex.QueryBuilder>(
  qb: QB,
  pagination?: Pagination,
) => {
  const { pageNumber, pageSize } = extractPagination(pagination);

  return qb.offset((pageNumber - 1) * pageSize).limit(pageSize);
};
