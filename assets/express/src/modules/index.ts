import { AuthServiceInterface } from './auth';
import { TodosServiceInterface } from './todos';

export type Services = {
  authService: AuthServiceInterface;
  todosService: TodosServiceInterface;
};
