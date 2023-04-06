import { Pagination } from '@common/query/pagination';

export const paginationDefaults = {
  page: 1,
  items: 20,
};

export const extractPagination = (pagination?: Pagination) =>
  Object.assign({}, paginationDefaults, pagination);
