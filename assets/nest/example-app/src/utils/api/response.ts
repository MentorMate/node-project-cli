import { ApiProperty } from '@nestjs/swagger';
import { Paginated, Pagination, extractPagination } from '@utils/query';

interface ErrorDTO {
  statusCode: number;
  message: string;
  error: string;
}

export enum Errors {
  BadRequest = 'Bad Request',
  Unauthorized = 'Unauthorized',
  NotFound = 'Not Found',
  Conflict = 'Conflict',
  UnprocessableEntity = 'Unprocessable Entity',
}

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  pagination?: Pagination,
): Paginated<T> => {
  return { data, meta: { ...extractPagination(pagination), total } };
};

export class BadRequestDto implements ErrorDTO {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: Errors.BadRequest })
  message: string;

  @ApiProperty({ example: Errors.BadRequest })
  error: string;
}

export class UnauthorizedDto implements ErrorDTO {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: Errors.Unauthorized })
  message: string;

  @ApiProperty({ example: Errors.Unauthorized })
  error: string;
}

export class NotFoundDto implements ErrorDTO {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Record not found' })
  message: string;

  @ApiProperty({ example: Errors.NotFound })
  error: string;
}

export class ConflictDto implements ErrorDTO {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Record already exists' })
  message: string;

  @ApiProperty({ example: Errors.Conflict })
  error: string;
}

export class UnprocessableEntityDto implements ErrorDTO {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid input' })
  message: string;

  @ApiProperty({ example: Errors.UnprocessableEntity })
  error: string;
}
