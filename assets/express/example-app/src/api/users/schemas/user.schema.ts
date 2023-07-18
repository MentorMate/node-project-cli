import { z } from 'zod';
import { email, password, withId, withTimestamps } from '@utils/validation';

export const userSchema = z
  .object({
    email: email,
    password: password,
  })
  .merge(withId)
  .merge(withTimestamps)
  .openapi({ ref: 'User' });
