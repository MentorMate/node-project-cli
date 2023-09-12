import { ApiProperty } from '@nestjs/swagger';

interface ErrorDto {
  statusCode: number;
  message: string;
  error: string;
}

export class Unauthorized implements ErrorDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

export class NotFoundDto implements ErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Record not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class ConflictDto implements ErrorDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Record already exists' })
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: string;
}

export class UnprocessableEntityDto implements ErrorDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid input' })
  message: string;

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}
