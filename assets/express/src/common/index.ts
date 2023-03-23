import { z } from 'zod';
import { NotFound, Conflict, Unauthorized } from 'http-errors';
import httpStatuses from 'statuses';

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

export class UnauthorizedException extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = UnauthorizedException.name;
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
  [UnauthorizedException.name]: Unauthorized,
};

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
  Unauthorized: (message = 'Unauthorized') => error(message),
};
