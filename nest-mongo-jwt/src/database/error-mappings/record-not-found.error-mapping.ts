import { RecordNotFoundError } from '@database/errors';
import { isDatabaseError } from '@database/utils';
import { ErrorMapping } from '@utils/error';

export const recordNotFoundErrorMapping = (message: string): ErrorMapping => ({
  isError: isDatabaseError,
  newError: () => new RecordNotFoundError(message),
});
