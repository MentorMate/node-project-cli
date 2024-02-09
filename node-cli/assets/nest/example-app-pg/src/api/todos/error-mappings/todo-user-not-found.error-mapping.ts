import { foreignKeyViolation } from '@database/error-mappings';

export const TodoUserNotFound = foreignKeyViolation(
  'fk_todos_user_id',
  'User not found',
);
