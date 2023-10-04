export const paginationDefaults = {
  pageNumber: 1,
  pageSize: 20,
};

export interface Pagination {
  pageNumber?: number;
  pageSize?: number;
}

interface PaginationResponse {
  totalPages: number;
  currentPage: number;
}

export interface Paginated<Entity> extends PaginationResponse {
  items: Entity[];
  total: number;
}

export const extractPagination = (pagination?: Pagination) => ({
  ...paginationDefaults,
  ...pagination,
});
