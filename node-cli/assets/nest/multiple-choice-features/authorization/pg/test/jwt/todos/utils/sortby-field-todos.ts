import { Todo } from '@api/todos/entities/todo.entity';
import { SortOrder } from '@utils/query';

type ListTodoSortColumn = 'name' | 'createdAt';

export const sortByField: (
  list: Todo[],
  field: ListTodoSortColumn,
  order?: SortOrder,
) => Todo[] = (list, field, order) => {
  return list.sort((a, b) => {
    if (order === 'desc') {
      return b[field].localeCompare(a[field]);
    }
    return a[field].localeCompare(b[field]);
  });
};
