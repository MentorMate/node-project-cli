import { Pagination } from '@utils/query/pagination';
import { Todo } from './todo.entity';

// TODO: This input is not validated
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
