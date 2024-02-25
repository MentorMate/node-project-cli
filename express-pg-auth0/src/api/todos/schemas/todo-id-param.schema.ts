import z from 'zod';

export const todoIdParamSchema = z.object({
  id: z.string(),
});
