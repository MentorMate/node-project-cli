import { sortByCreatedAt } from './todos-by-created-at.sorter';

const queryBuilder = {
  orderBy: jest.fn(),
};

describe('sortByCreatedAt', () => {
  const order = 'asc';

  it('should sort by createdAt', () => {
    sortByCreatedAt(queryBuilder as never, order);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('createdAt', order);
  });
});
