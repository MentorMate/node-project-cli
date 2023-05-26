import { Todo } from '@todos/entities';
import { SortOrder } from '@utils/query';

type ListTodoSortColumn = 'name' | 'createdAt';

export const sortByField: (
  list: Todo[],
  field: ListTodoSortColumn,
  order?: SortOrder
) => Todo[] = (list, field, order) => {
  return list.sort((a, b) => {
    if (order === 'desc') {
      // eslint-disable-next-line security/detect-object-injection
      return b[field].localeCompare(a[field]);
    }
    // eslint-disable-next-line security/detect-object-injection
    return a[field].localeCompare(b[field]);
  });
};
