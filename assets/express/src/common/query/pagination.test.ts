import z, { ZodArray, ZodObject, ZodNumber } from 'zod';
import { paginated } from './pagination';

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
