import { Paginated, Pagination, extractPagination } from '@utils/query';

export const paginatedResponse = <T>(
  items: T[],
  total: number,
  pagination?: Pagination
): Paginated<T> => {
  const { pageNumber, pageSize } = extractPagination(pagination);

  return {
    items,
    total: total,
    currentPage: pageNumber,
    totalPages: Math.ceil(total / pageSize),
  };
};
