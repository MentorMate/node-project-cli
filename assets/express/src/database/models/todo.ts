import { TodoAttributes } from '@common/data/entities';
import { Insert, Update } from './utils/operations';

export { Todo } from '@common/data/entities';

export type TodoColumns = TodoAttributes;

export type InsertTodo = Insert<TodoColumns>;

export type UpdateTodo = Update<TodoColumns>;
