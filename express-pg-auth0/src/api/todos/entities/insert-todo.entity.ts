import { Insert } from '@database/operations';
import { Todo } from './todo.entity';

export type InsertTodo = Insert<Partial<Todo>>;
