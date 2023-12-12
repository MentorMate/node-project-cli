import {
  Pagination,
  extractPagination,
  paginationDefaults,
} from './pagination';

describe('extractPagination', () => {
  it('should return the provided pagination', () => {
    const pagination: Pagination = { pageNumber: 1, pageSize: 10 };
    expect(extractPagination(pagination)).toEqual(pagination);
  });

  it('should supply the defaults for any missing pagination properties', () => {
    expect(extractPagination()).toEqual(paginationDefaults);
    expect(extractPagination({ pageNumber: 1 })).toEqual({
      ...paginationDefaults,
      pageNumber: 1,
    });
    expect(extractPagination({ pageSize: 10 })).toEqual({
      ...paginationDefaults,
      pageSize: 10,
    });
  });
});
