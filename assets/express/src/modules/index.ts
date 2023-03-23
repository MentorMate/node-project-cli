import z from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  todo as todoSchema,
  todoAttributes as todoFieldsSchema,
  user as userSchema,
  userAttributes as userFieldsSchema,
} from '@common/data/models';
import { AuthService, AuthServiceInterface } from './auth';
import { TodosServiceInterface } from './todos';

export * from './todos';
export * from './auth';

export const registry = new OpenAPIRegistry();

const authSchema = z.object({
  idToken: z.string(),
});

const schemaNames = {
  User: userSchema,
  Todo: todoSchema,
  JwtTokens: authSchema,
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
  password: z.string(),
});

export const claims = z.object({
  sub: z.string(),
  email: models.User.shape.email,
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
export type Register = z.infer<typeof postUserInput>;
export type UpdateUserInput = z.infer<typeof patchUserInput>;
export type Login = z.infer<typeof login>;
export type Claims = z.infer<typeof claims>;
export type Tokens = z.infer<typeof tokens>;
export type JwtConfig = z.infer<typeof jwtConfig>;

export type Services = {
  authService: AuthServiceInterface;
  todosService: TodosServiceInterface;
};
