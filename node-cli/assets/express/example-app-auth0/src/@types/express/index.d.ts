import { AuthService } from '@api/auth';
import { TodosService } from '@api/todos';

declare module 'express-serve-static-core' {
  interface Request {
    auth: {
      payload: {
        sub: string;
      };
      token: string;
    };
    services: {
      authService: AuthService;
      todosService: TodosService;
    };
  }
}
