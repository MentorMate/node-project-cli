import { z, ZodType } from 'zod';

// TODO: move to a config or smth
export const paginationDefaults = {
  page: 1,
  items: 20,
};

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

export interface Paginated<Entity> {
  data: Entity[];
  meta: PaginationMeta;
}

export const paginated = <Schema extends ZodType<unknown>>(schema: Schema) =>
  z.object({
    data: z.array(schema),
    meta: paginationMeta,
  });

export const extractPagination = (pagination?: Pagination) =>
  Object.assign({}, paginationDefaults, pagination);
