import express, { json, ErrorRequestHandler, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createHttpTerminator } from 'http-terminator';
import z from 'zod';
import pino, { Logger } from 'pino';
import createError from 'http-errors';

//
// Environment
//
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().int().gte(1024).lte(65535),
});

type Environment = z.infer<typeof envSchema>;

//
// Middleware
//
const logRequest = function (logger: Logger): RequestHandler {
  return function({ method, path }, _res, next) {
    // DO NOT use console: https://expressjs.com/en/advanced/best-practice-performance.html#do-logging-correctly
    logger.info({ method, path });
    next();
  };
};

// This will modify the request with the result of the validation, as well
const validateRequest = function (schema: RequestSchema): RequestHandler {
  return function(req, _res, next) {
    const result = schema.safeParse(req);

    if (!result.success) {
      const error = createError.UnprocessableEntity('Bad Data');
      error.errors = result.error.issues;
      return next(error);
    }

    for (const [k, v] of Object.entries(result.data)) {
      req[k as RequestKey] = v;
    }

    next();
  }
};

const errorHandler = function (logger: Logger): ErrorRequestHandler {
  return function (err, _req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    // If you call next() with an error after you have started writing the response (for example, if you encounter an error while streaming
    // the response to the client) the Express default error handler closes the connection and fails the request.
    // So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already
    // been sent to the client
    if (res.headersSent) {
      return next(err)
    }

    if (createError.isHttpError(err)) {
      res
        .status(err.statusCode)
        .send({
          message: err.message,
          ...(err.errors && { errors: err.errors }),
        });
    } else {
      logger.error(err);

      res
        .status(500)
        .send({ message: 'Internal Server Error' });
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

type Zod = typeof z | typeof z.coerce;

const attrs = {
  id: (z: Zod) => z.number().int().positive(),
  name: (z: Zod) => z.string().min(1).max(50),
  note: (z: Zod) => z.string().min(1).max(255),
  ts: (z: Zod) => z.string().datetime(),
};

const idSchema = z.object({
  id: attrs.id(z),
});

const timestampsSchema = z.object({
  createdAt: attrs.ts(z),
  updatedAt: attrs.ts(z),
  deletedAt: attrs.ts(z).nullable(),
});

const todoFieldsSchema = z.object({
  name: attrs.name(z),
  note: attrs.note(z).nullable(),
});

const todoModelSchema = todoFieldsSchema
  .merge(idSchema)
  .merge(timestampsSchema);

type Todo = z.infer<typeof todoModelSchema>;

//
// A mock database table using an array
//
const todosStore: Todo[] = [{
  id: 1,
  name: 'Laundry',
  note: null,
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString(),
  deletedAt: null,
}];

export type IsNullable<T, K> = null extends T ? K : never;
export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> & Partial<Pick<T, NullableKeys<T>>>;

//
// A mock repository just to have some async functionality
//
const todoRepo = {
  // Doesn't really need to be async
  async create(input: NullableKeysPartial<Pick<Todo, 'name' | 'note'>>): Promise<Todo> {
    if (todosStore.find(todo => todo.name === input.name)) {
      throw new Error(`name already taken`);
    }

    const todo = {
      id: todosStore.length + 1,
      name: input.name,
      note: input.note ?? null,
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
      deletedAt: null,
    };

    todosStore.push(todo);

    return todo;
  },
  async find(id: number): Promise<Todo | undefined> {
    return todosStore.find(todo => (todo.id === id) && (todo.deletedAt === null));
  },
  async update(id: number, input: Partial<Pick<Todo, 'name' | 'note'>>): Promise<Todo | undefined> {
    const todo = todosStore.find(todo => (todo.id === id) && (todo.deletedAt === null));

    if (!todo) {
      return;
    }

    if (todosStore.find(todo => (todo.name === input.name) && (todo.id !== id))) {
      throw new Error(`name already taken`);
    }

    return Object.assign(todo, {
      ...input,
      updatedAt: (new Date()).toISOString(),
    });
  },
  async delete(id: number): Promise<number> {
    const todo = todosStore.find(todo => (todo.id === id) && (todo.deletedAt === null));

    if (!todo) {
      return 0;
    }

    todo.deletedAt = (new Date()).toISOString();
    return 1;
  },
  async list(): Promise<Todo[]> {
    return todosStore.filter(todo => todo.deletedAt === null);
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

type HttpMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
type RequestKey = 'params' | 'query' | 'body';
type RequestSchema = z.ZodObject<{ [k in RequestKey]?: z.AnyZodObject }>;
type ResponseSchema = z.AnyZodObject;

interface Route {
  method: HttpMethod;
  path: string;
  middleware?: RequestHandler[];
  handler: RequestHandler;
  request?: RequestSchema;
  response?: ResponseSchema;
}

const routes: Route[] = [
  // Hello World
  {
    method: 'get',
    path: '/',
    handler: function (_req, res) {
      res.send('Hello, World!');
    },
  },

  // Todos
  {
    method: 'post',
    path: '/todos',
    request: z.object({
      body: todoFieldsSchema,
    }),
    response: todoModelSchema,
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.create(req.body);
      res.status(201).send(todo);
    }),
  },
  {
    method: 'put',
    path: '/todos/:id',
    request: z.object({
      params: z.object({
        id: attrs.id(z.coerce),
      }),
      body: todoFieldsSchema,
    }),
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.update(req.params.id as never as number, req.body);

      if (todo) {
        res.send(todo);
      } else {
        res.status(404).send();
      }
    }),
  },
  {
    method: 'patch',
    path: '/todos/:id',
    request: z.object({
      params: z.object({
        id: attrs.id(z.coerce),
      }),
      body: todoFieldsSchema.partial(),
    }),
    handler: asyncHandler(async (req, res) => {
      const todo = await todoRepo.update(req.params.id as never as number, req.body);

      if (todo) {
        res.send(todo);
      } else {
        res.status(404).send();
      }
    }),
  },
  {
    method: 'delete',
    path: '/todos/:id',
    request: z.object({
      params: z.object({
        id: attrs.id(z.coerce),
      }),
    }),
    handler: asyncHandler(async (req, res) => {
      const deletedCount = await todoRepo.delete(req.params.id as never as number);
      const status = deletedCount === 0 ? 404 : 204;
      res.status(status).send();
    }),
  },
  {
    method: 'get',
    path: '/todos/:id',
    request: z.object({
      params: z.object({
        id: attrs.id(z.coerce),
      }),
    }),
    response: todoModelSchema,
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
    method: 'get',
    path: '/todos',
    response: z.object({
      data: z.array(todoModelSchema),
      meta: paginationMetaSchema,
    }),
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
    method: 'get',
    path: '/healthz/live',
    handler: function (_req, res) {
      res.send('OK');
    }
  },
  {
    method: 'get',
    path: '/healthz/ready',
    handler: function (_req, res) {
      res.send('OK');
    }
  }
];

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
        colorize: false
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
    console.log('Shutting down...')
    await httpTerminator.terminate();
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
};

bootstrap();
>>>>>>> 39200e4191294239be09139780f733da7085305f
