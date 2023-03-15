/* eslint-disable @typescript-eslint/no-namespace */
import Knex, { Knex as KnexOriginal } from 'knex';
import {
  Pagination,
  Sort,
  FilterMap,
  SorterMap,
  ListQuery,
  filter,
  sort,
  paginate,
  list,
} from '@database';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder<TRecord, TResult> {
      /**
       * Given a column-to-value map and column-to-filter map, applies the filters to the query builder.
       * Filter map must cover all columns in the column-to-value map.
       *
       * Example:
       * ```
       * queryBuilder.filter(
       *   {
       *     name: 'John',
       *     isAncient: true,
       *   },
       *   {
       *     name: (queryBuilder, name) => queryBuilder.whereILike('name', `%${name}%`),
       *     isAncient: (queryBuilder, isAncient) => queryBuilder.where('age', isAncient ? '>=' : '<', 100),
       *   }
       * );
       * ```
       */
      filter<Filters>(
        filters: Filters | undefined,
        filterMap: FilterMap<
          KnexOriginal.QueryBuilder<TRecord, TResult>,
          Filters
        >
      ): this;
      /**
       * Given a list of column sortings an a column-to-sorter map, applies the sorters to the query builder.
       * Sorter map must cover all columns in the column sortings list.
       *
       * Example:
       * ```
       * queryBuilder.sort(
       *   [
       *     { column: 'name' },
       *     { column: 'age', order: 'desc'}
       *   ],
       *   {
       *     name: (queryBuilder, order) => queryBuilder.orderBy('name', order),
       *     age: (queryBuilder, order) => queryBuilder.orderBy('age', order),
       *   }
       * );
       * ```
       */
      sort<SortColumn extends string>(
        sorts: Sort<SortColumn>[] | undefined,
        sorterMap: SorterMap<QueryBuilder<TRecord, TResult>, SortColumn>
      ): this;
      /**
       * Offset pagination. This a shorthand for the following:
       *
       * ```
       * queryBuilder
       *   .offset((pagination.page - 1) * pagination.items)
       *   .limit(pagination.items);
       * ```
       */
      paginate(pagination?: Pagination): this;
      /**
       * Applies filtering, sorting and pagination. This is a shorthand for the following:
       *
       * ```
       * queryBuilder
       *  .filter(query.filters, listMaps.filterMap)
       *  .sort(query.sorts, listMaps.sorterMap)
       *  .paginate(query.pagination);
       * ```
       */
      list<Filters, SortKey extends string>(
        query: ListQuery<Filters, Sort<SortKey>, Pagination>,
        listMaps: {
          filterMap?: FilterMap<QueryBuilder<TRecord, TResult>, Filters>;
          sorterMap?: SorterMap<QueryBuilder<TRecord, TResult>, SortKey>;
        }
      ): this;
    }
  }
}

export const register = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!Knex.filter) {
    Knex.QueryBuilder.extend('filter', function (filters, filterMap) {
      return filters ? filter(this, filters, filterMap) : this;
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!Knex.sort) {
    Knex.QueryBuilder.extend('sort', function (sorts, sorterMap) {
      return sorts ? sort(this, sorts || [], sorterMap) : this;
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!Knex.paginate) {
    Knex.QueryBuilder.extend('paginate', function (pagination) {
      return paginate(this, pagination);
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!Knex.list) {
    Knex.QueryBuilder.extend('list', function (input, listMaps) {
      return list(this, input, listMaps);
    });
  }
};
