import { z } from 'zod';

export const todoIdDTO = z.object({
  id: z.coerce.number().int().positive().openapi({ example: 1 }),
});
