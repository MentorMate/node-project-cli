import { prefixRoutes } from '@utils/api';
import { createTodoRoute } from './create.route';
import { deleteTodoRoute } from './delete.route';
import { getTodoRoute } from './get.route';
import { listTodosRoute } from './list.route';
import { updateTodoRoute } from './update.route';

export const todoRoutes = prefixRoutes('/v1/todos', [
  createTodoRoute,
  deleteTodoRoute,
  getTodoRoute,
  listTodosRoute,
  updateTodoRoute,
]);
