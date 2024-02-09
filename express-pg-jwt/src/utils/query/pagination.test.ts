import z, { ZodArray, ZodObject, ZodNumber } from 'zod';
import { paginated, extractPagination, paginationDefaults } from './pagination';

describe('paginated', () => {
  it('should return a new schema that describes a paginated resuls', () => {
    const schema = z.number();
    const paginatedSchema = paginated(schema);

    expect(paginatedSchema.shape).toEqual(
      expect.objectContaining({
        data: expect.any(ZodArray),
        meta: expect.any(ZodObject),
      })
    );

    expect(paginatedSchema.shape.data.element).toBe(schema);

    expect(paginatedSchema.shape.meta.shape).toEqual(
      expect.objectContaining({
        total: expect.any(ZodNumber),
        page: expect.any(ZodNumber),
        items: expect.any(ZodNumber),
      })
    );
  });
});

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
