import { filterByName, filterByCompleted } from './todo.filters';

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

describe('filterByCompleted', () => {
  const completed = true;

  it('should filter by completed', () => {
    filterByCompleted(queryBuilder as never, completed);
    expect(queryBuilder.where).toHaveBeenCalledWith({ completed });
  });
});
