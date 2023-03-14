import { todoAttrs } from 'src/modules';
import { z } from 'zod';

export const idTodoDTO = z.object({
  id: todoAttrs.ID(z.coerce),
});
