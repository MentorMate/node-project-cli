import { SortOrder } from '@utils/query';
import {
  Allow,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Trim } from '@utils/class-transformers';
import { ApiProperty } from '@nestjs/swagger';

export enum TodosSortBy {
  Name = 'name',
  CreatedAt = 'createdAt',
}

export class FindAllTodosQueryDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined
  )
  @IsOptional()
  completed?: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @Trim()
  @IsEnum(TodosSortBy)
  column?: TodosSortBy;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  @Allow(undefined)
  order?: SortOrder | undefined;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageNumber?: number = 1;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageSize?: number = 20;
}
