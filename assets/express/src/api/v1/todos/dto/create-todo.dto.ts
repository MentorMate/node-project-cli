import { z } from 'zod';
import { todo } from '@common/data/models';

export const createTodoDTO = z.object({
  name: todo.shape.name,
  note: todo.shape.note.optional(),
});
