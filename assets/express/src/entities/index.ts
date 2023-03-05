import { z } from 'zod';

export const User = z.object({
  email: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'user']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof User>;

export type UserPayload = Pick<User, 'email' | 'password'> &
  Partial<Pick<User, 'role'>>;
