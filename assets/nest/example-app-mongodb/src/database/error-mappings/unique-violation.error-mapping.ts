import { DuplicateRecordError } from '@database/errors';
import { isUniqueViolation } from '@database/utils/error';
import { ErrorMapping } from '@utils/error';

export const uniqueViolation = (
  constraint: string,
  message: string,
): ErrorMapping => ({
  isError: isUniqueViolation(constraint),
  newError: () => new DuplicateRecordError(message),
});
