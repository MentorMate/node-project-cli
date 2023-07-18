import { filterByCompleted } from './todos-by-completed.filter';

const queryBuilder = {
  whereILike: jest.fn(),
  where: jest.fn(),
};

describe('filterByCompleted', () => {
  const completed = true;

  it('should filter by completed', () => {
    filterByCompleted(queryBuilder as never, completed);
    expect(queryBuilder.where).toHaveBeenCalledWith({ completed });
  });
});
