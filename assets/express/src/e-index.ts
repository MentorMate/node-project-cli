import express, { json, ErrorRequestHandler, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createHttpTerminator } from 'http-terminator';
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenAPIGenerator,
  RouteConfig,
  ResponseConfig,
} from '@asteasolutions/zod-to-openapi';
import z, { AnyZodObject, ZodType, ZodEnum } from 'zod';
import pino, { Logger } from 'pino';
import createError, { NotFound, Conflict } from 'http-errors';
import pg, { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import Knex, { Knex as KnexType } from 'knex';
import { Tables } from 'knex/types/tables';
import httpStatuses from 'statuses';
import { writeFileSync } from 'fs';

extendZodWithOpenApi(z);

//
// Environment
//
const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production']),

  // HTTP
  PORT: z.coerce.number().int().gte(1024).lte(65535),

  // PostgreSQL
  // TODO: this limits your options, should be revisited
  PGHOST: z.string().trim().min(1),
  PGPORT: z.coerce.number().int().gte(1024).lte(65535),
  PGUSER: z.string().trim().min(1),
  PGPASSWORD: z.string().trim().min(1),
  PGDATABASE: z.string().trim().min(1),
});

type Environment = z.infer<typeof envSchema>;

// Validate env
const env: Environment = envSchema.parse(process.env);

//
// Logger
//
const logger = pino({
  name: 'http',
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      colorize: false,
    },
  }),
});

//
// PG Initialization
//

// https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v); // keep as string for now

//
// Knex
//

const knex = Knex({
  client: 'pg',
  // We don't need to specify the connection options as we're using the default env var names
  // see https://node-postgres.com/features/connecting#environment-variables
  // see https://www.postgresql.org/docs/9.1/libpq-envars.html
  connection: {},
  pool: {
    // the minimum is for all connections rather than alive, so it has to be set to zero
    // see https://knexjs.org/guide/#pool
    min: 0,
  },
  log: {
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    debug: logger.debug.bind(logger),
    deprecate: logger.warn.bind(logger),
  },
});

//
// Error Handling
//

// Service layer exceptions
class DuplicateRecordException extends Error {
  constructor(message = 'Record already exists') {
    super(message);
    this.name = DuplicateRecordException.name;
  }
}

class RecordNotFoundException extends Error {
  constructor(message = 'Record not found') {
    super(message);
    this.name = RecordNotFoundException.name;
  }
}

// These aliases are just for readability
type DatabaseErrorCode = Exclude<DatabaseError['code'], undefined>;
type DatabaseConstaintname = string;
type ErrorConstructor = () => Error;

const dbToServiceErrorMap: Record<
  DatabaseErrorCode,
  Record<DatabaseConstaintname, ErrorConstructor>
> = {
  [PostgresError.UNIQUE_VIOLATION]: {
    unq_todos_name: () =>
      new DuplicateRecordException('To-Do name already taken'),
  },

  // To-Dos don't hold a `userId`, this is just an example
  [PostgresError.FOREIGN_KEY_VIOLATION]: {
    fk_todos_user_id: () => new RecordNotFoundException('User not found'),
  },
};

const handleDbError = (e: unknown) => {
  if (
    !(e instanceof DatabaseError) ||
    e.code === undefined ||
    e.constraint === undefined
  ) {
    throw e;
  }

  const constructor = dbToServiceErrorMap[e.code]?.[e.constraint];

  if (constructor) {
    throw constructor();
  }

  throw e;
};

const definedOrFail = <T>(errorFactory: () => Error) => {
  return (result: T | undefined): T => {
    if (!result) {
      throw errorFactory();
    }
    return result;
  };
};

const updatedOrFail = (errorFactory: () => Error) => {
  return (result: number): number => {
    if (result === 0) {
      throw errorFactory();
    }
    return result;
  };
};

const definedOrNotFound = <T>(message?: string) =>
  definedOrFail<T>(() => new RecordNotFoundException(message));
const updatedOrNotFound = (message?: string) =>
  updatedOrFail(() => new RecordNotFoundException(message));

const serviceToHttpErrorMap = {
  [RecordNotFoundException.name]: NotFound,
  [DuplicateRecordException.name]: Conflict,
};

const handleServiceError: ErrorRequestHandler = (err, _req, _res, next) => {
  const klass = serviceToHttpErrorMap[err.name];
  const error = klass ? new klass(err.message) : err;
  next(error);
};

//
// Sort List Paginate utilities
//
const sortOrder = z.enum(['asc', 'desc']);

type SortOrder = z.infer<typeof sortOrder>;

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}

const pagination = z
  .object({
    page: z.coerce.number().int().positive(),
    items: z.coerce.number().int().positive(),
  })
  .partial();

const paginationMeta = pagination.required().extend({
  total: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof pagination>;
export type PaginationMeta = z.infer<typeof paginationMeta>;

interface Paginated<Record> {
  data: Record[];
  meta: PaginationMeta;
}

const paginated = <S extends ZodType<unknown>>(schema: S) =>
  z.object({
    data: z.array(schema),
    meta: paginationMeta,
  });

const paginationDefaults = {
  page: 1,
  items: 20,
};

const extractPagination = (pagination?: Pagination) =>
  Object.assign({}, paginationDefaults, pagination);

/**
 * A Filter is a function that accepts a QueryBuilder for a given entity and a value,
 * applies the filter to the QueryBuilder and returns it.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type FilterByName = Filter<Knex.QueryBuilder<Tables['todos']>, Todo['name']>;
 *
 * const filterByName: FilterByName = (qb, name) => qb.where({ name });
 * ```
 */
type Filter<QueryBuilder extends KnexType.QueryBuilder, Value> = (
  qb: QueryBuilder,
  value: Value
) => QueryBuilder;

/**
 * A FilerMap is a map is a mapping from query param names to filters.
 * The type requires that the list of keys is exhaustive, in order to
 * enforce that all query parameters have a corresponding filter implemented.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * // This would typically be obtained via z.infer<typeof listTodosFiltersSchema>
 * interface ListTodosFilters {
 *   id?: number;
 *   name?: string;
 * };
 *
 * const listTodosFilterMap: FilterMap<KnexType.QueryBuilder<Tables['todos']>, ListTodosFilters> = {
 *   id: (qb, id) => qb.where({ id }),
 *   name: (qb, name) => qb.whereILike('name', `%${name}%`),
 * };
 * ```
 */
export type FilterMap<QueryBuilder extends KnexType.QueryBuilder, Filters> = {
  // Since query params are usually optional,
  // we loop through the query params removing their optionality via `-?`,
  // then map them to a filter of their value excluding undefined.
  [K in keyof Filters]-?: Filter<QueryBuilder, Exclude<Filters[K], undefined>>;
};

/**
 * A Sorter is a function that accepts a QueryBuilder for a given entity and a sort order,
 * applies the sorting to the QueryBuilder and returns it.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type SortByName = Sorter<Knex.QueryBuilder<Tables['todos']>>;
 *
 * const sortByName: SortByName = (qb, order) => qb.orderBy('name', order);
 * ```
 */
type Sorter<QueryBuilder extends KnexType.QueryBuilder> = (
  qb: QueryBuilder,
  order?: SortOrder
) => QueryBuilder;

/**
 * A SorterMap is a map is a mapping from query param names to sorters.
 * The type requires that the list of keys is exhaustive, in order to
 * enforce that all sort parameters have a corresponding sorter implemented.
 *
 * Example:
 * ```
 * import { Knex } from 'knex';
 * import { Tables } from 'knex/types/tables';
 *
 * type ListTodoSortColumn = 'name' | 'createdAt';
 *
 * const listTodosSorterMap: SorterMap<KnexType.QueryBuilder<Tables['todos']>, ListTodoSortColumn> = {
 *   name: (qb, order) => qb.orderBy('name', order),
 *   createdAt: (qb, order) => qb.orderBy('createdAt', order),
 * };
 * ```
 */
export type SorterMap<
  QueryBuilder extends KnexType.QueryBuilder,
  SortColumn extends string
> = Record<SortColumn, Sorter<QueryBuilder>>;

export interface ListQuery<Filters, Sort, Pagination> {
  filters?: Filters;
  sorts?: Sort[];
  pagination?: Pagination;
}

//
// Knex extensions
//
const filter = <
  QB extends KnexType.QueryBuilder,
  Query extends Record<string, unknown>,
  Filters extends FilterMap<QB, Query>
>(
  qb: QB,
  filters: Query,
  filterMap: Filters
): QB =>
  Object.entries(filters)
    .filter(([, v]) => v !== undefined)
    .reduce<QB>(
      (qb, [k, v]) => filterMap[k as keyof Filters](qb, v as never),
      qb
    );

const sort = <QB extends KnexType.QueryBuilder, SortColumn extends string>(
  qb: QB,
  sorts: Sort<SortColumn>[],
  sorterMap: SorterMap<QB, SortColumn>
): QB =>
  sorts.reduce<QB>((qb, sort) => sorterMap[sort.column](qb, sort.order), qb);

const paginate = <QB extends KnexType.QueryBuilder>(
  qb: QB,
  pagination?: Pagination
) => {
  const { page, items } = extractPagination(pagination);

  return qb.offset((page - 1) * items).limit(items);
};

export const list = <
  QB extends KnexType.QueryBuilder,
  Filters,
  SortColumn extends string,
  FM extends FilterMap<KnexType.QueryBuilder, Filters>,
  SM extends SorterMap<KnexType.QueryBuilder, SortColumn>
>(
  qb: QB,
  query: ListQuery<Filters, Sort<SortColumn>, Pagination>,
  { filterMap, sorterMap }: { filterMap: FM; sorterMap: SM }
): QB =>
  qb
    .filter(query.filters, filterMap)
    .sort(query.sorts, sorterMap)
    .paginate(query.pagination);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!Knex.filter) {
  Knex.QueryBuilder.extend('filter', function (filters, filterMap) {
    return filters ? filter(this, filters, filterMap) : this;
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!Knex.sort) {
  Knex.QueryBuilder.extend('sort', function (sorts, sorterMap) {
    return sorts ? sort(this, sorts || [], sorterMap) : this;
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!Knex.paginate) {
  Knex.QueryBuilder.extend('paginate', function (pagination) {
    return paginate(this, pagination);
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!Knex.list) {
  Knex.QueryBuilder.extend('list', function (input, listMaps) {
    return list(this, input, listMaps);
  });
}

//
// Middleware
//
const logRequest = function (logger: Logger): RequestHandler {
  return function ({ method, url }, _res, next) {
    logger.info(`${method} ${url}`);
    next();
  };
};

// This will modify the request with the result of the validation, as well
const validateRequest = function (schema: RequestSchema): RequestHandler {
  return function (req, _res, next) {
    const result = z.object(schema).safeParse(req);

    if (!result.success) {
      const error = createError.UnprocessableEntity('Bad Data');
      error.errors = result.error.issues;
      return next(error);
    }

    for (const [k, v] of Object.entries(result.data)) {
      req[k as RequestKey] = v;
    }

    next();
  };
};

const errorHandler = function (logger: Logger): ErrorRequestHandler {
  return function (err, _req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    // If you call next() with an error after you have started writing the response (for example, if you encounter an error while streaming
    // the response to the client) the Express default error handler closes the connection and fails the request.
    // So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already
    // been sent to the client
    if (res.headersSent) {
      logger.error(err);
      return next(err);
    }

    if (createError.isHttpError(err)) {
      res.status(err.statusCode).send({
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
    } else {
      logger.error(err);

      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
};

//
// Validation
//
type Zod = typeof z | typeof z.coerce;

const attrs = {
  ID: (z: Zod) => z.number().int().positive().openapi({ example: 1 }),
  Name: (z: Zod) => z.string().min(1).max(50).openapi({ example: 'Laundry' }),
  Note: (z: Zod) =>
    z.string().min(1).max(255).openapi({ example: 'Buy detergent' }),
  Timestamp: (z: Zod) =>
    z.string().datetime().openapi({ example: '2023-02-28T14:39:24.086Z' }),
};

const idSchema = z.object({
  id: attrs.ID(z),
});

const timestampsSchema = z.object({
  createdAt: attrs.Timestamp(z),
  updatedAt: attrs.Timestamp(z),
  deletedAt: attrs.Timestamp(z).nullable(),
});

const todoFieldsSchema = z.object({
  name: attrs.Name(z),
  note: attrs.Note(z).nullable(),
});

const todoSchema = todoFieldsSchema.merge(idSchema).merge(timestampsSchema);

const registry = new OpenAPIRegistry();

const schemaNames = {
  Todo: todoSchema,
} as const;

const models = Object.fromEntries(
  Object.entries(schemaNames).map(([name, schema]) => [
    name,
    registry.register(name, schema),
  ])
) as typeof schemaNames;

const error = (message: string) =>
  z.object({ message: z.string().openapi({ example: message }) });

const zodErrorIssue = z.object({
  code: z.string().openapi({ example: 'invalid_type' }),
  expected: z.string().openapi({ example: 'string' }),
  received: z.string().openapi({ example: 'number' }),
  path: z.array(z.string()).openapi({ example: ['address', 'zip'] }),
  message: z.string().openapi({ example: 'Expected string, received number' }),
});

const response = {
  NoContent: () => ({ description: httpStatuses.message[204] as string }),
  NotFound: (message = 'Record not found') => error(message),
  Conflict: (message = 'Record already exists') => error(message),
  UnprocessableEntity: (message = 'Invalid input') =>
    error(message).extend({ errors: z.array(zodErrorIssue) }),
};

export type IsNullable<T, K> = null extends T ? K : never;
export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>;

export type Todo = z.infer<typeof todoSchema>;
export type InsertTodo = NullableKeysPartial<z.infer<typeof todoFieldsSchema>>;
export type UpdateTodo = Partial<InsertTodo>;

//
// List To-Dos inputs
//
const listTodosFilters = z.object({
  id: z.coerce.number().optional(),
  name: z.string().optional(),
});

type ListTodosFilters = z.infer<typeof listTodosFilters>;

const listTodosFilterMap: FilterMap<
  KnexType.QueryBuilder<Tables['todos']>,
  ListTodosFilters
> = {
  id: (qb, id) => qb.where({ id }),
  name: (qb, name) => qb.whereILike('name', `%${name}%`),
};

const listTodosSortColumn = z.enum(['name', 'createdAt']);

type ListTodosSortColumn = z.infer<typeof listTodosSortColumn>;

const sorts = <S extends ZodEnum<[string, ...string[]]>>(schema: S) =>
  z.array(
    z.object({
      column: schema,
      order: sortOrder.optional(),
    })
  );

const listTodosSorts = sorts(listTodosSortColumn);

const listTodosSorterMap: SorterMap<
  KnexType.QueryBuilder<Tables['todos']>,
  ListTodosSortColumn
> = {
  name: (qb, order) => qb.orderBy('name', order),
  createdAt: (qb, order) => qb.orderBy('createdAt', order),
};

const listTodosMaps = {
  filterMap: listTodosFilterMap,
  sorterMap: listTodosSorterMap,
};

const listTodosQuery = z.object({
  filters: listTodosFilters.optional(),
  sorts: listTodosSorts.optional(),
  pagination: pagination.optional(),
});

type ListTodosQuery = z.infer<typeof listTodosQuery>;

//
// A mock repository just to have some async functionality
//

const first = <T>([record]: T[]) => record;

const parseCount = ([{ count }]: Array<{ count?: string | number }>): number =>
  typeof count === 'string' ? parseInt(count) : (count as number);

const postTodoInput = z.object({
  name: models.Todo.shape.name,
  note: models.Todo.shape.note.default(null),
});

const putTodoInput = z.object({
  name: models.Todo.shape.name,
  note: models.Todo.shape.note.default(null),
});

const patchTodoInput = todoFieldsSchema.partial();

type CreateTodoInput = z.infer<typeof postTodoInput>;
type UpdateTodoInput = z.infer<typeof patchTodoInput>;

const todoRepo = {
  // These don't really need to use async/await
  async create(input: CreateTodoInput): Promise<Todo> {
    return await knex('todos')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  },
  // TODO: Handle the empty object in request body:
  // Empty .update() call detected! Update data does not contain any values to update. This will result in a faulty query
  async update(id: number, input: UpdateTodoInput): Promise<Todo | undefined> {
    return await knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError)
      .then(definedOrNotFound('To-Do not found'));
  },
  async delete(id: number): Promise<number> {
    return await knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .update('deletedAt', new Date())
      .then(updatedOrNotFound('To-Do not found'));
  },
  async find(id: number): Promise<Todo | undefined> {
    return await knex('todos')
      .where({ id })
      .whereNull('deletedAt')
      .first()
      .then(definedOrNotFound('To-Do not found'));
  },
  async list(query: ListTodosQuery): Promise<Paginated<Todo>> {
    const qb = knex('todos').whereNull('deletedAt');

    const data = await qb.clone().list(query, listTodosMaps);

    const total = await qb
      .clone()
      .filter(query.filters, listTodosFilterMap)
      .count()
      .then(parseCount);

    return {
      data: data,
      meta: {
        ...extractPagination(query.pagination),
        total,
      },
    };
  },
};

//
// Routes
//

// A utility function that does the `.catch(next)` for you.
// This is, basically, `express-async-handler`: https://github.com/Abazhenov/express-async-handler/blob/master/index.js
//
// Example:
// ```
// function (req, res, next) {
//   service.create(req.body)
//     .then(record => res.status(201).send(record))
//     .catch(next);
// }
//
// turns into
// asyncHandler(async function(req, res) {
//   const todo = await service.create(req.body);
//   res.status(201).send(todo);
// })
// ```
const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return function (req, res, next) {
    const result = handler(req, res, next);
    return Promise.resolve(result).catch(next);
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type HttpMethod = RouteConfig['method'];
type RequestKey = keyof NonNullable<RouteConfig['request']>;
type RequestSchema = Omit<
  NonNullable<RouteConfig['request']>,
  'body' | 'headers'
> & { body?: AnyZodObject; headers?: AnyZodObject };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ResponseSchema = RouteConfig['responses'];

interface Route
  extends Omit<
    RouteConfig,
    'request' | 'responses' | 'parameters' | 'requestBody'
  > {
  middleware?: RequestHandler[];
  handler: RequestHandler;
  request?: RequestSchema;
  responses: Record<string, AnyZodObject | ResponseConfig>;
}

const routes: Route[] = [
  // Hello World
  {
    operationId: 'hello-world',
    summary: 'Hello, World!',
    description: 'Says "Hello, World!"',
    method: 'get',
    path: '/',
    handler: function (_req, res) {
      res.send('Hello, World!');
    },
    responses: {
      200: {
        description: 'Says hi.',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: 'Hello, World!',
            },
          },
        },
      },
    },
  },

  // Todos
  {
    operationId: 'todo-create',
    summary: 'Create a To-Do',
    description: 'Create a new To-Do item',
    tags: ['Todo'],
    method: 'post',
    path: '/todos',
    request: {
      body: postTodoInput,
    },
    responses: {
      201: models.Todo,
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.create(req.body);

      res.status(201).send(todo);
    }),
  },
  {
    operationId: 'todo-replace',
    summary: 'Update a To-Do',
    description: 'Update a To-Do item',
    tags: ['Todo'],
    method: 'put',
    path: '/todos/:id',
    request: {
      params: z.object({
        id: attrs.ID(z.coerce),
      }),
      body: putTodoInput,
    },
    responses: {
      200: models.Todo,
      404: response.NotFound(),
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.update(
        req.params.id as never as number,
        req.body
      );

      res.send(todo);
    }),
  },
  {
    operationId: 'todo-update',
    summary: 'Partially update a To-Do',
    description: 'Partially update a To-Do item',
    tags: ['Todo'],
    method: 'patch',
    path: '/todos/:id',
    request: {
      params: z.object({
        id: attrs.ID(z.coerce),
      }),
      body: patchTodoInput,
    },
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.update(
        req.params.id as never as number,
        req.body
      );

      res.send(todo);
    }),
    responses: {
      200: models.Todo,
      404: response.NotFound(),
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
  },
  {
    operationId: 'todo-delete',
    summary: 'Delete a To-Do',
    description: 'Soft delete a To-Do item',
    tags: ['Todo'],
    method: 'delete',
    path: '/todos/:id',
    request: {
      params: z.object({
        id: attrs.ID(z.coerce),
      }),
    },
    responses: {
      204: response.NoContent(),
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: asyncHandler(async (req, res) => {
      await todoRepo.delete(req.params.id as never as number);

      res.status(204).send();
    }),
  },
  {
    operationId: 'todo-get',
    summary: 'Get a To-Do',
    description: 'Get a To-Do item',
    tags: ['Todo'],
    method: 'get',
    path: '/todos/:id',
    request: {
      params: z.object({
        id: attrs.ID(z.coerce),
      }),
    },
    responses: {
      200: models.Todo,
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.find(req.params.id as never as number);

      res.send(todo);
    }),
  },
  {
    operationId: 'todo-list',
    summary: 'List To-Dos',
    description: 'List To-Do items',
    tags: ['Todo'],
    method: 'get',
    path: '/todos',
    request: {
      query: listTodosQuery,
    },
    responses: {
      200: paginated(models.Todo),
    },
    handler: asyncHandler(async (req, res) => {
      const todos = await todoRepo.list(req.query as never as ListTodosQuery);

      res.send(todos);
    }),
  },

  // Healthchecks
  {
    operationId: 'health-liveness',
    tags: ['Healthchecks'],
    method: 'get',
    path: '/healthz/live',
    handler: function (_req, res) {
      res.send('OK');
    },
    responses: {
      200: {
        description: 'Liveness endpoint',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: 'OK',
            },
          },
        },
      },
    },
  },
  {
    operationId: 'health-readiness',
    tags: ['Healthchecks'],
    method: 'get',
    path: '/healthz/ready',
    responses: {
      200: {
        description: 'Readiness endpoint',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              example: 'OK',
            },
          },
        },
      },
    },
    handler: function (_req, res) {
      res.send('OK');
    },
  },
];

for (const route of routes) {
  registry.registerPath({
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    method: route.method,
    path: route.path.replaceAll(
      /:[a-zA-Z]+/g,
      (match) => `{${match.substring(1)}}`
    ),
    ...(route.request && {
      request: {
        params: route.request.params,
        query: route.request.query,
        headers: route.request.headers,
        ...(route.request.body && {
          body: {
            content: {
              'applicatin/json': {
                schema: route.request.body,
              },
            },
          },
        }),
      },
    }),
    responses: Object.fromEntries(
      Object.entries(route.responses).map(([code, schema]) => [
        code,
        schema instanceof z.ZodObject
          ? {
              description:
                httpStatuses.message[code as never as number] ??
                'Unknown response code',
              content: { 'applicatin/json': { schema } },
            }
          : schema,
      ])
    ),
  });
}

const generator = new OpenAPIGenerator(registry.definitions, '3.0.0');

const document = generator.generateDocument({
  info: {
    version: '1.0.0',
    title: 'My API',
    description: 'This is the API',
  },
  servers: [{ url: '' }],
});

writeFileSync('swagger.json', JSON.stringify(document, null, 2), {
  encoding: 'utf-8',
});

//
// Bootstrap
//
function bootstrap() {
  // Create app
  const app = express();

  const middleware = [
    logRequest(logger),
    helmet(),
    cors(),
    json(),
    // DO compression: https://expressjs.com/en/advanced/best-practice-performance.html#use-gzip-compression
    compression(),
  ];

  // Register middleware
  app.use(middleware);

  // Register routes
  for (const route of routes) {
    const middleware = route.middleware ? [...route.middleware] : [];

    if (route.request) {
      middleware.push(validateRequest(route.request));
    }

    if (middleware.length > 0) {
      app[route.method](route.path, middleware, route.handler);
    } else {
      app[route.method](route.path, route.handler);
    }
  }

  // Register error handlers
  app.use(handleServiceError);
  app.use(errorHandler(logger));

  // Start server
  const server = app.listen(env.PORT, () => {
    console.log(`App is running on http://localhost:${env.PORT}`);
  });

  // Graceful Shutdown
  const httpTerminator = createHttpTerminator({ server });

  const shutdown = async () => {
    console.log('Shutting down...');
    await httpTerminator.terminate();
    await knex.destroy();
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
