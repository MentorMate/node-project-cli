import { HttpException } from '../../utils/http-exception';

export const TodoNotFound = (message = 'To-Do not found') =>
  new HttpException(404, message);
