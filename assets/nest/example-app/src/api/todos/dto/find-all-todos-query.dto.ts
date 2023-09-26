import { PaginationDTO } from '@utils/query/pagination';
import { SortOrder } from '@utils/query';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Trim } from '@utils/class-transformers';

class FiltersDTO {
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  completed?: boolean;
}

class SortsDTO {
  @Trim()
  @IsEnum(['name', 'createdAt'])
  column: 'name' | 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  @Allow(undefined)
  order?: SortOrder | undefined;
}

export class FindAllTodosQueryDTO {
  @Type(() => FiltersDTO)
  @ValidateNested()
  @IsOptional()
  filters?: FiltersDTO;

  @Type(() => SortsDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  sorts?: SortsDTO[];

  @Type(() => PaginationDTO)
  @ValidateNested()
  @IsOptional()
  pagination?: PaginationDTO;
}
