import { z, ZodType } from 'zod';

export const pagination = z
  .object({
    page: z.coerce.number().int().positive(),
    items: z.coerce.number().int().positive(),
  })
  .partial();

const paginationMeta = pagination.required().extend({
  total: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof pagination>;
export type PaginationMeta = z.infer<typeof paginationMeta>;

export interface Paginated<Record> {
  data: Record[];
  meta: PaginationMeta;
}

export const paginated = <S extends ZodType<unknown>>(schema: S) =>
  z.object({
    data: z.array(schema),
    meta: paginationMeta,
  });
