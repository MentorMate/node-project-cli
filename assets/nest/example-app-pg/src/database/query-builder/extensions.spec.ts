import { Pagination, Sort, SortOrder } from '@utils/query';
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

    expect(filterMap.name).toHaveBeenCalledWith(
      queryBuilder,
      filters.name,
      Object.keys(filterMap)[0],
    );
    expect(filterMap.height).not.toHaveBeenCalled();
    expect(filterMap.age).toHaveBeenCalledWith(
      queryBuilder,
      filters.age,
      Object.keys(filterMap)[1],
    );
  });
});

describe('sort', () => {
  it('should apply all the sortings to the query builder', () => {
    const queryBuilder = {};

    const sorts: Sort<'name' | 'age'>[] = [
      { column: 'name' },
      { column: 'age', order: SortOrder.Desc },
    ];

    const sorterMap = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      name: jest.fn((qb, _order) => qb),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      age: jest.fn((qb, _order) => qb),
    };

    sort(queryBuilder as never, sorts, sorterMap);

    expect(sorterMap.name).toHaveBeenCalledWith(
      queryBuilder,
      SortOrder.Asc,
      Object.keys(sorterMap)[0],
    );
    expect(sorterMap.age).toHaveBeenCalledWith(
      queryBuilder,
      SortOrder.Desc,
      Object.keys(sorterMap)[1],
    );
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

    const pagination: Pagination = {
      pageNumber: 3,
      pageSize: 15,
    };

    paginate(queryBuilder as never, pagination);

    expect(queryBuilder.offset).toHaveBeenCalledWith(30);
    expect(queryBuilder.limit).toHaveBeenCalledWith(15);
  });
});
