import { uniqueViolation } from '@database/error-mappings';

export const UserEmailTaken = uniqueViolation('User email already taken');
