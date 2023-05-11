import z, { ZodEnum } from 'zod';

export const sortOrder = z.enum(['asc', 'desc']);

export type SortOrder = z.infer<typeof sortOrder>;

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}

export const sorts = <S extends ZodEnum<[string, ...string[]]>>(schema: S) =>
  z.array(
    z.object({
      column: schema,
      order: sortOrder.optional(),
    })
  );
