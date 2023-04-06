import { Todo } from '@common/data/models/todo';
import { SortOrder } from '@common/query';

type ListTodoSortColumn = 'name' | 'createdAt';

export const sortByField: (
  list: Todo[],
  field: ListTodoSortColumn,
  order?: SortOrder
) => Todo[] = (list, field, order) => {
  return list.sort((a, b) => {
    if (order === 'desc') {
      return b[field].localeCompare(a[field]);
    }
    return a[field].localeCompare(b[field]);
  });
};
