import { Sort } from '@common/query';
import { filter, sort, paginate } from './extensions';

describe('filter', () => {
  it('should apply all the filters to the query builder', () => {
    const queryBuilder = {};

    const filters = {
      name: 'John',
      height: undefined,
      age: 42,
    };

    const filterMap = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      name: jest.fn((qb, _name: string) => qb),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      age: jest.fn((qb, _age: number) => qb),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      height: jest.fn((qb, _height: number) => qb),
    };

    filter(queryBuilder as never, filters, filterMap as never);

    expect(filterMap.name).toHaveBeenCalledWith(queryBuilder, filters.name);
    expect(filterMap.height).not.toHaveBeenCalled();
    expect(filterMap.age).toHaveBeenCalledWith(queryBuilder, filters.age);
  });
});

describe('sort', () => {
  it('should apply all the sortings to the query builder', () => {
    const queryBuilder = {};

    const sorts: Sort<'name' | 'age'>[] = [
      { column: 'name' },
      { column: 'age', order: 'desc' },
    ];

    const sorterMap = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      name: jest.fn((qb, _order) => qb),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      age: jest.fn((qb, _order) => qb),
    };

    sort(queryBuilder as never, sorts, sorterMap);

    expect(sorterMap.name).toHaveBeenCalledWith(queryBuilder, 'asc');
    expect(sorterMap.age).toHaveBeenCalledWith(queryBuilder, 'desc');
  });
});

describe('paginate', () => {
  it('should apply an offset and a limit to the query builder', () => {
    const queryBuilder = {
      offset() {
        return this;
      },
      limit() {
        return this;
      },
    };

    jest.spyOn(queryBuilder, 'offset');
    jest.spyOn(queryBuilder, 'limit');

    const pagination = {
      page: 3,
      items: 15,
    };

    paginate(queryBuilder as never, pagination);

    expect(queryBuilder.offset).toHaveBeenCalledWith(30);
    expect(queryBuilder.limit).toHaveBeenCalledWith(15);
  });
});
