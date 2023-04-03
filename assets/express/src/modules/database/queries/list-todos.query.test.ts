import { listTodosMaps } from './list-todos.query';

describe('listTodosFilterMap', () => {
  const listTodosFilterMap = listTodosMaps.filterMap;

  const queryBuilder = {
    whereILike: jest.fn(),
    where: jest.fn(),
  };

  it('should be defined', () => {
    expect(listTodosFilterMap).toBeDefined();
  });

  describe('name', () => {
    const name = 'Jonh';

    it('should filter by name', () => {
      listTodosFilterMap.name(queryBuilder as never, name);
      expect(queryBuilder.whereILike).toHaveBeenCalledWith('name', `%${name}%`);
    });
  });

  describe('completed', () => {
    const completed = true;

    it('should filter by completed', () => {
      listTodosFilterMap.completed(queryBuilder as never, completed);
      expect(queryBuilder.where).toHaveBeenCalledWith('completed', completed);
    });
  });
});

describe('listTodosSorterMap', () => {
  const listTodosSorterMap = listTodosMaps.sorterMap;

  const queryBuilder = {
    orderBy: jest.fn(),
  };

  it('should be defined', () => {
    expect(listTodosSorterMap).toBeDefined();
  });

  describe('name', () => {
    const order = 'desc';

    it('should sort by name', () => {
      listTodosSorterMap.name(queryBuilder as never, order);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('name', order);
    });
  });

  describe('createdAt', () => {
    const order = 'asc';

    it('should sort by createdAt', () => {
      listTodosSorterMap.createdAt(queryBuilder as never, order);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('createdAt', order);
    });
  });
});
