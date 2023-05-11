import { sortByCreatedAt, sortByName } from '../sorters/todo.sorters';

const queryBuilder = {
  orderBy: jest.fn(),
};

describe('sortByName', () => {
  const order = 'desc';

  it('should sort by name', () => {
    sortByName(queryBuilder as never, order);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('name', order);
  });
});

describe('sortByCreatedAt', () => {
  const order = 'asc';

  it('should sort by createdAt', () => {
    sortByCreatedAt(queryBuilder as never, order);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('createdAt', order);
  });
});
