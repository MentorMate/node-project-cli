import z from 'zod';
import { email, password } from '../attributes';

export const register = z.object({
  email: email,
  password: password,
});

export type Register = z.infer<typeof register>;
