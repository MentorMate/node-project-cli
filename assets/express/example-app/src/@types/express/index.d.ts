import { AuthServiceInterface } from '@api/auth/interfaces';
import { TodosServiceInterface } from '@api/todos/interfaces';

declare module 'express-serve-static-core' {
  interface Request {
    auth: {
      sub: string;
      email: string;
    };
    services: {
      authService: AuthServiceInterface;
      todosService: TodosServiceInterface;
    };
  }
}
