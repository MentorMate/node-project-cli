import z from 'zod';
import { email, password } from '../attributes';

export const login = z.object({
  email: email,
  password: password,
});

export type Login = z.infer<typeof login>;
