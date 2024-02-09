import { RecordNotFoundError } from '@database/errors';
import { isForeignKeyViolation } from '@database/utils/error';
import { ErrorMapping } from '@utils/error';

export const foreignKeyViolation = (
  constraint: string,
  message: string
): ErrorMapping => ({
  isError: isForeignKeyViolation(constraint),
  newError: () => new RecordNotFoundError(message),
});
