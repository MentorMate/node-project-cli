import { Pagination } from '@utils/query';
import { Todo } from './todo.entity';

export interface ListTodosQuery {
  filters?: Partial<Pick<Todo, 'name' | 'completed'>>;
  sorts?:
    | {
        column: 'name' | 'createdAt';
        order?: 'asc' | 'desc' | undefined;
      }[]
    | undefined;
  pagination?: Pagination;
}
