import { todoSchema } from './todo.schema';

export const updateTodoSchema = todoSchema
  .pick({
    name: true,
    note: true,
    completed: true,
  })
  .partial();
