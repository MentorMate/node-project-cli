import { pagination, sorts } from '@utils/query';
import { z } from 'zod';

export const listTodosQuerySchema = z.object({
  filters: z
    .object({
      name: z.string().optional(),
      completed: z.boolean().optional(),
    })
    .optional(),
  sorts: sorts(z.enum(['name', 'createdAt'])).optional(),
  pagination: pagination.optional(),
});
