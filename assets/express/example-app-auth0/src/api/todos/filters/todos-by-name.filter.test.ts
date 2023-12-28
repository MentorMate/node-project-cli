import { filterByName } from './todos-by-name.filter';

const queryBuilder = {
  whereILike: jest.fn(),
  where: jest.fn(),
};

describe('filterByName', () => {
  const name = 'Jonh';

  it('should filter by name', () => {
    filterByName(queryBuilder as never, name);
    expect(queryBuilder.whereILike).toHaveBeenCalledWith('name', `%${name}%`);
  });
});
