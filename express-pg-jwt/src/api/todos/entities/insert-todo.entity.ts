import { Insert } from '@database/operations';
import { Todo } from './todo.entity';

export type InsertTodo = Insert<
  Pick<Todo, 'userId' | 'name' | 'note' | 'completed'> & { id?: string } 
>;