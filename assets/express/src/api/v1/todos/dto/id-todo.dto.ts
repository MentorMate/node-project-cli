import { z } from 'zod';

export const idTodoDTO = z.object({
  id: z.coerce.number().int().positive().openapi({ example: 1 }),
});
