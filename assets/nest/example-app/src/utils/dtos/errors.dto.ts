import { ApiProperty } from '@nestjs/swagger';
import { Errors } from '@utils/enums';

interface ErrorDto {
  statusCode: number;
  message: string;
  error: string;
}

export class BadRequestDto implements ErrorDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: Errors.BadRequest })
  message: string;

  @ApiProperty({ example: Errors.BadRequest })
  error: string;
}

export class UnauthorizedDto implements ErrorDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: Errors.Unauthorized })
  message: string;

  @ApiProperty({ example: Errors.Unauthorized })
  error: string;
}

export class NotFoundDto implements ErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Record not found' })
  message: string;

  @ApiProperty({ example: Errors.NotFound })
  error: string;
}

export class ConflictDto implements ErrorDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Record already exists' })
  message: string;

  @ApiProperty({ example: Errors.Conflict })
  error: string;
}

export class UnprocessableEntityDto implements ErrorDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid input' })
  message: string;

  @ApiProperty({ example: Errors.UnprocessableEntity })
  error: string;
}
