import { z } from 'zod';
import { email, password } from '@utils/validation';

export const credentialsSchema = z
  .object({
    email: email,
    password: password,
  })
  .openapi({ ref: 'Credentials' });
