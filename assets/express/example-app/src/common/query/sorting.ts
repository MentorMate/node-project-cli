import z from 'zod';

export const sortOrder = z.enum(['asc', 'desc']);

export type SortOrder = z.infer<typeof sortOrder>;

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}
