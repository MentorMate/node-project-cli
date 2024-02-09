import { AuthService } from "@api/auth";
import { TodosService } from "@api/todos";

declare module 'express-serve-static-core' {
  interface Request {
    auth: {
      sub: string;
      email: string;
    };
    services: {
      authService: AuthService;
      todosService: TodosService;
    };
  }
}
