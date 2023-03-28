import { BaseTodoAttributes, TodoAttributes } from '@common/data/models';
import { Insert, Update } from './utils/operations';

export { Todo } from '@common/data/models';

export type InsertTodo = Insert<TodoAttributes>;

export type UpdateTodo = Update<BaseTodoAttributes>;
