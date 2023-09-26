import { HttpException } from './http-exception';

export const Unauthorized = (message = 'No authorization token was found') =>
  new HttpException(401, message);

export const UnprocessableEntity = (message = 'Bad Data') =>
  new HttpException(422, message);

export const UserConflict = (message = 'User email already taken') =>
  new HttpException(409, message);

export const InvalidCredentials = (message = 'Invalid email or password') =>
  new HttpException(422, message);
