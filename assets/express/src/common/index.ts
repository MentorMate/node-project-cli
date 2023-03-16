import { z } from 'zod';
import { NotFound, Conflict } from 'http-errors';
import httpStatuses from 'statuses';
import {
  GenericRequestHandler,
  RequestSchema,
  RouteDefinition,
} from '../api/interfaces';

export type Zod = typeof z | typeof z.coerce;

export class DuplicateRecordException extends Error {
  constructor(message = 'Record already exists') {
    super(message);
    this.name = DuplicateRecordException.name;
  }
}

export class RecordNotFoundException extends Error {
  constructor(message = 'Record not found') {
    super(message);
    this.name = RecordNotFoundException.name;
  }
}

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

export const definedOrNotFound = <T>(message?: string) =>
  definedOrFail<T>(() => new RecordNotFoundException(message));
export const updatedOrNotFound = (message?: string) =>
  updatedOrFail(() => new RecordNotFoundException(message));

export const serviceToHttpErrorMap = {
  [RecordNotFoundException.name]: NotFound,
  [DuplicateRecordException.name]: Conflict,
};

export type IsNullable<T, K> = null extends T ? K : never;
export type NullableKeys<T> = { [K in keyof T]: IsNullable<T[K], K> }[keyof T];
export type NullableKeysPartial<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>;

const error = (message: string) =>
  z.object({ message: z.string().openapi({ example: message }) });

const zodErrorIssue = z.object({
  code: z.string().openapi({ example: 'invalid_type' }),
  expected: z.string().openapi({ example: 'string' }),
  received: z.string().openapi({ example: 'number' }),
  path: z.array(z.string()).openapi({ example: ['address', 'zip'] }),
  message: z.string().openapi({ example: 'Expected string, received number' }),
});

export const response = {
  NoContent: () => ({ description: httpStatuses.message[204] as string }),
  NotFound: (message = 'Record not found') => error(message),
  Conflict: (message = 'Record already exists') => error(message),
  UnprocessableEntity: (message = 'Invalid input') =>
    error(message).extend({ errors: z.array(zodErrorIssue) }),
};

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
export const asyncHandler = <T extends RequestSchema>(
  handler: GenericRequestHandler<T>
): GenericRequestHandler<T> => {
  return function (req, res, next) {
    const result = handler(req, res, next);
    return Promise.resolve(result).catch(next);
  };
};

export function attachPrefix(routes: RouteDefinition<any>[], prefix: string) {
  return routes.map((routeDefinition) => {
    routeDefinition.path = `${prefix}${routeDefinition.path}`;

    return routeDefinition;
  });
}
