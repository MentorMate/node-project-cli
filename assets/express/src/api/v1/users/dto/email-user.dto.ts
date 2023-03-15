import { userAttrs } from 'src/modules';
import { z } from 'zod';

export const emailUserDTO = z.object({
  email: userAttrs.Email(z),
});
