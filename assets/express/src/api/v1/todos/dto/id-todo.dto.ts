import { todoAttrs } from '@modules';
import { z } from 'zod';

export const idTodoDTO = z.object({
  id: todoAttrs.ID(z.coerce),
});
