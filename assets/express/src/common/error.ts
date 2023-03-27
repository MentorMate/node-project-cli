import { NotFound, Conflict, Unauthorized } from 'http-errors';

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
