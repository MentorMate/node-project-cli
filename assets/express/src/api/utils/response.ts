import z from 'zod';
import httpStatuses from 'statuses';

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
