export const paginationDefaults = {
  page: 1,
  items: 20,
};

export interface Pagination {
  page?: number;
  items?: number;
}

export interface PaginationMeta extends Pagination {
  total: number;
}

export interface Paginated<Entity> {
  data: Entity[];
  meta: PaginationMeta;
}

export const extractPagination = (pagination?: Pagination) => ({
  ...paginationDefaults,
  ...pagination,
});
