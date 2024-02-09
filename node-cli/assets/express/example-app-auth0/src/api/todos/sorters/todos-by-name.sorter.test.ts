import { sortByName } from './todos-by-name.sorter';

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
