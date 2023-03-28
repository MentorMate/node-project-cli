import z from 'zod';
import { todo } from '@common/data/models';

export const todoIdDTO = z.object({
  id: todo.shape.id.coerce(),
});
