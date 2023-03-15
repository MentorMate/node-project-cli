import { attachPrefix } from '@common';
import { TodoService } from 'src/modules';

import getTodoRouteOptions from './get-todo';
import listTodosRouteOptions from './list-todos';
import createTodoRouteOptions from './create-todo';
import updateTodoRouteOptions from './update-todo';
import patchTodoRouteOptions from './patch-todo';
import deleteTodoRouteOptions from './delete-todo';

export default function ({ todoService }: { todoService: TodoService }) {
  const routes = [
    getTodoRouteOptions({ todoService }),
    listTodosRouteOptions({ todoService }),
    createTodoRouteOptions({ todoService }),
    updateTodoRouteOptions({ todoService }),
    patchTodoRouteOptions({ todoService }),
    deleteTodoRouteOptions({ todoService }),
  ];

  return attachPrefix(routes, '/todos');
}
