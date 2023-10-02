export const paginationDefaults = {
  pageNumber: 1,
  pageSize: 20,
};

export interface Pagination {
  pageNumber?: number;
  pageSize?: number;
}

export interface Paginated<Entity> {
  items: Entity[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const extractPagination = (pagination?: Pagination) => ({
  ...paginationDefaults,
  ...pagination,
});
