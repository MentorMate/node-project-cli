import { z } from 'zod';
import { id, timestamps } from '../attribute-sets';

export const todoAttributes = z.object({
  name: z.string().trim().min(1).max(255).openapi({ example: 'Laundry' }),
  note: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .nullable()
    .openapi({ example: 'Buy detergent' }),
  completed: z.boolean().openapi({ example: false }),
  userId: z.number().openapi({ example: 1 }),
});

export type TodoAttributes = z.infer<typeof todoAttributes>;

export const todo = todoAttributes.merge(id).merge(timestamps);

export type Todo = z.infer<typeof todo>;
