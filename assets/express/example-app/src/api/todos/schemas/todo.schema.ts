import { z } from 'zod';
import { withId, withTimestamps } from '@utils/validation';
import { userSchema } from '@api/users/schemas';

export const todoSchema = z
  .object({
    userId: userSchema.shape.id,
    name: z.string().trim().min(1).max(255).openapi({ example: 'Laundry' }),
    note: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .nullable()
      .openapi({ example: 'Buy detergent' }),
    completed: z.boolean().openapi({ example: false }),
  })
  .merge(withId)
  .merge(withTimestamps)
  .openapi({ ref: 'ToDo' });
