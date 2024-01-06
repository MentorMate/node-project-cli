import { DuplicateRecordError } from '@database/errors';
import { isUniqueViolation } from '@database/utils/error';
import { ErrorMapping } from '@utils/error';

export const uniqueViolation = (message: string): ErrorMapping => ({
  isError: isUniqueViolation,
  newError: () => new DuplicateRecordError(message),
});
