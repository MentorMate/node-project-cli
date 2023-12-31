import z from 'zod';
import { todoSchema } from './todo.schema';

export const todoIdParamSchema = z.object({
  id: todoSchema.shape.id.coerce(),
});
