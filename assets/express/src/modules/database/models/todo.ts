import { TodoAttributes } from '@common/data/models';
import { Insert, Update } from './utils/operations';

export { Todo } from '@common/data/models';

export type TodoColumns = TodoAttributes;

export type InsertTodo = Insert<TodoColumns>;

export type UpdateTodo = Update<TodoColumns>;
