import { userAttrs } from '@modules';
import { z } from 'zod';

export const emailUserDTO = z.object({
  email: userAttrs.Email(z),
});
