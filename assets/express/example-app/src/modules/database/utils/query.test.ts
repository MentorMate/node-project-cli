import { extractPagination, paginationDefaults } from './query';

describe('extractPagination', () => {
  it('should return the provided pagination', () => {
    const pagination = { page: 1, items: 10 };
    expect(extractPagination(pagination)).toEqual(pagination);
  });

  it('should supply the defaults for any missing pagination properties', () => {
    expect(extractPagination()).toEqual(paginationDefaults);
    expect(extractPagination({ page: 1 })).toEqual({
      ...paginationDefaults,
      page: 1,
    });
    expect(extractPagination({ items: 10 })).toEqual({
      ...paginationDefaults,
      items: 10,
    });
  });
});
