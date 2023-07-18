import { uniqueViolation } from '@database/error-mappings';

export const UserEmailTaken = uniqueViolation(
  'unq_users_email',
  'User email already taken',
);
