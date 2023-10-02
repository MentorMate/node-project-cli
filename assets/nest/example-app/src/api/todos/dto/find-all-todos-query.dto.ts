import { SortOrder } from '@utils/query';
import {
  Allow,
  IsArray,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToClass } from 'class-transformer';
import { Trim } from '@utils/class-transformers';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@utils/dto/pagination.dto';

class FiltersDto {
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  completed?: boolean;
}

enum TodosSortBy {
  Name = 'name',
  CreatedAt = 'createdAt',
}
class TodosSortByDto {
  @Trim()
  @IsEnum(TodosSortBy)
  column: TodosSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  @Allow(undefined)
  order?: SortOrder | undefined;
}

export class FindAllTodosQueryDto {
  @ApiProperty({
    type: FiltersDto,
    required: false,
    example: { name: 'todoName', completed: true },
  })
  @Type(() => FiltersDto)
  @Transform(({ value }) => plainToClass(FiltersDto, JSON.parse(value)))
  @ValidateNested()
  @IsOptional()
  filters?: FiltersDto;

  @ApiProperty({
    type: TodosSortByDto,
    required: false,
    isArray: true,
    example: [{ column: 'name', order: SortOrder.Asc }],
  })
  @Type(() => TodosSortByDto)
  @Transform(({ value }) => plainToClass(TodosSortByDto, JSON.parse(value)))
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  sorts?: TodosSortByDto[];

  @ApiProperty({
    type: PaginationDto,
    required: false,
    example: { page: 1, items: 2 },
  })
  @Type(() => PaginationDto)
  @Transform(({ value }) => plainToClass(PaginationDto, JSON.parse(value)))
  @ValidateNested()
  @IsOptional()
  pagination?: PaginationDto;
}
