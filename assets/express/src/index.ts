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
import z, { AnyZodObject, ZodType } from 'zod';
import pino, { Logger } from 'pino';
import createError from 'http-errors';
import * as pg from 'pg';
import httpStatuses from 'statuses';
import { writeFileSync } from 'fs';

extendZodWithOpenApi(z);

//
// Environment
//
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().int().gte(1024).lte(65535),
});

type Environment = z.infer<typeof envSchema>;

//
// PG Initialization
//

// Parses 64bit integers, list of type IDs here https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v); // keep as string for now

//
// Middleware
//
const logRequest = function (logger: Logger): RequestHandler {
  return function ({ method, path }, _res, next) {
    // DO NOT use console: https://expressjs.com/en/advanced/best-practice-performance.html#do-logging-correctly
    logger.info({ method, path });
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
const paginationMetaSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
});

const paginated = <S extends ZodType<unknown>>(schema: S) =>
  z.object({
    data: z.array(schema),
    meta: paginationMetaSchema,
  });

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

type Todo = z.infer<typeof todoSchema>;

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

// const schemas = schemaNames;
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

//
// A mock database table using an array
//
const todosStore: Todo[] = [
  {
    id: 1,
    name: 'Laundry',
    note: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export type IsNullable<T, K> = null extends T ? K : never;
export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>;

//
// A mock repository just to have some async functionality
//
const todoRepo = {
  // Doesn't really need to be async
  async create(
    input: NullableKeysPartial<Pick<Todo, 'name' | 'note'>>
  ): Promise<Todo> {
    if (todosStore.find((todo) => todo.name === input.name)) {
      throw new Error(`name already taken`);
    }

    const todo = {
      id: todosStore.length + 1,
      name: input.name,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    todosStore.push(todo);

    return todo;
  },
  async find(id: number): Promise<Todo | undefined> {
    return todosStore.find((todo) => todo.id === id && todo.deletedAt === null);
  },
  async update(
    id: number,
    input: Partial<Pick<Todo, 'name' | 'note'>>
  ): Promise<Todo | undefined> {
    const todo = todosStore.find(
      (todo) => todo.id === id && todo.deletedAt === null
    );

    if (!todo) {
      return;
    }

    if (todosStore.find((todo) => todo.name === input.name && todo.id !== id)) {
      throw new Error(`name already taken`);
    }

    return Object.assign(todo, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
  },
  async delete(id: number): Promise<number> {
    const todo = todosStore.find(
      (todo) => todo.id === id && todo.deletedAt === null
    );

    if (!todo) {
      return 0;
    }

    todo.deletedAt = new Date().toISOString();
    return 1;
  },
  async list(): Promise<Todo[]> {
    return todosStore.filter((todo) => todo.deletedAt === null);
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
      body: models.Todo.pick({ name: true, note: true }),
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
      body: models.Todo.pick({ name: true, note: true }),
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

      if (todo) {
        res.send(todo);
      } else {
        res.status(404).send();
      }
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
      body: todoFieldsSchema.partial(),
    },
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.update(
        req.params.id as never as number,
        req.body
      );

      if (todo) {
        res.send(todo);
      } else {
        res.status(404).send();
      }
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
      const deletedCount = await todoRepo.delete(
        req.params.id as never as number
      );
      const status = deletedCount === 0 ? 404 : 204;
      res.status(status).send();
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

      if (todo) {
        res.send(todo);
      } else {
        res.status(404).send();
      }
    }),
  },
  {
    operationId: 'todo-list',
    summary: 'List To-Dos',
    description: 'List To-Do items',
    tags: ['Todo'],
    method: 'get',
    path: '/todos',
    responses: {
      200: paginated(models.Todo),
    },
    handler: asyncHandler(async (_req, res) => {
      // TODO: impl pagination
      const todos = await todoRepo.list();

      res.send({
        data: todos,
        meta: {
          total: todos.length,
          page: 1,
          perPage: 20,
        },
      });
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
    path: route.path.replaceAll(/:[a-zA-Z]+/g, match => `{${match.substring(1)}}`),
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

writeFileSync('swagger.json', JSON.stringify(document, null, 2), { encoding: 'utf-8' });

//
// Bootstrap
//
function bootstrap() {
  // Validate env
  const env: Environment = envSchema.parse(process.env);

  // Create app
  const app = express();

  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

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

  // Register error handler
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
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
