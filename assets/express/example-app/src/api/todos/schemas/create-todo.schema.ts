import { z } from 'zod';
import { todoSchema } from './todo.schema';

export const createTodoSchema = z.object({
  name: todoSchema.shape.name,
  note: todoSchema.shape.note.optional(),
  completed: todoSchema.shape.completed.optional().default(false),
});
