import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { todoSchema, todoFieldsSchema, TodoService } from './todos';
import { userSchema, userFieldsSchema, UserService } from './users';
import { authSchema, AuthService } from './auth';

export * from './users';
export * from './todos';
export * from './auth';

export const registry = new OpenAPIRegistry();

const schemaNames = {
  User: userSchema,
  Todo: todoSchema,
  Auth: authSchema,
} as const;

export const models = Object.fromEntries(
  Object.entries(schemaNames).map(([name, schema]) => [
    name,
    registry.register(name, schema),
  ])
) as typeof schemaNames;

export const postTodoInput = z.object({
  name: models.Todo.shape.name,
  note: models.Todo.shape.note.default(null),
});

export const putTodoInput = z.object({
  name: models.Todo.shape.name,
  note: models.Todo.shape.note.default(null),
});

export const patchTodoInput = todoFieldsSchema.partial();

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof postTodoInput>;
export type UpdateTodoInput = z.infer<typeof patchTodoInput>;

export const postUserInput = z.object({
  email: models.User.shape.email,
  password: models.User.shape.password,
  role: models.User.shape.role.default('user'),
});

export const putUserInput = z.object({
  email: models.User.shape.email,
  password: models.User.shape.password,
  role: models.User.shape.role.default('user'),
});

export const postAuthInput = z.object({
  email: models.User.shape.email,
  password: models.User.shape.password,
});

export const postAuthToken = z.object({
  token: z.string(),
});

export const patchUserInput = userFieldsSchema.partial();

export type User = z.infer<typeof userSchema>;
export type UserForExternalUse = Omit<User, 'password'>;
export type CreateUserInput = z.infer<typeof postUserInput>;
export type UpdateUserInput = z.infer<typeof patchUserInput>;
export type RegisterUser = UserForExternalUse & JWT;
export type AuthInput = z.infer<typeof postAuthInput>;
export type JWT = z.infer<typeof postAuthToken>;

export type Services = {
  userService: UserService;
  todoService: TodoService;
  authService: AuthService;
};
