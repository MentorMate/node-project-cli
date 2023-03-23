import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { todoSchema, todoFieldsSchema, TodoService } from './todos';
import { userSchema, userFieldsSchema } from './users';
import { authSchema, AuthService } from './auth';

export * from './users';
export * from './todos';
export * from './auth';
export * from './jwt';
export * from './password';

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
});

export const putUserInput = z.object({
  email: models.User.shape.email,
  password: models.User.shape.password,
});

export const login = z.object({
  email: models.User.shape.email,
  password: models.User.shape.password,
});

export const claims = z.object({
  sub: models.User.shape.id.optional(),
  email: models.User.shape.email.optional(),
});

export const jwtConfig = z.object({
  secret: z.string().trim().min(1),
  expiresIn: z.coerce.number().int().gte(1000).or(z.string()),
});

/**
 * Possible tokens
 * id_token, access_token, refresh_token
 * see: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export const tokens = z.object({
  idToken: z.string(),
});

export const patchUserInput = userFieldsSchema.partial();

export type User = z.infer<typeof userSchema>;
export type UserForExternalUse = Omit<User, 'password'>;
export type CreateUserInput = z.infer<typeof postUserInput>;
export type UpdateUserInput = z.infer<typeof patchUserInput>;
export type Login = z.infer<typeof login>;
export type Claims = z.infer<typeof claims>;
export type Tokens = z.infer<typeof tokens>;
export type JwtConfig = z.infer<typeof jwtConfig>;

export type Services = {
  todoService: TodoService;
  authService: AuthService;
};
