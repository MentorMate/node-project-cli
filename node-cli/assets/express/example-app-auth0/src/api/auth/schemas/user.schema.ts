import { z } from 'zod';

export const UserSchema = z
  .object({
    userId: z.string(),
    email: z.string(),
  })
  .openapi({ ref: 'User' });
