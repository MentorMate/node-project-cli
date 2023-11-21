import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageNumber?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageSize?: number;
}
