import { foreignKeyViolation } from '../utils';

export const TodoUserNotFound = foreignKeyViolation(
  'fk_todos_user_id',
  'User not found'
);
