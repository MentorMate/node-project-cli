import { z } from 'zod';
import { email, password } from '../attributes';
import { id, timestamps } from '../attribute-sets';

export const userAttributes = z.object({
  email: email,
  password: password,
});

export type UserAttributes = z.infer<typeof userAttributes>;

export const user = userAttributes.merge(id).merge(timestamps);

export type User = z.infer<typeof user>;
