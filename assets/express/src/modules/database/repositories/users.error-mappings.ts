import { uniqueViolation } from '../utils';

export const UserEmailTaken = uniqueViolation(
  'unq_users_email',
  'User email already taken'
);
