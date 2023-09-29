import { PaginationDTO } from '@utils/query/pagination';
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

class FiltersDTO {
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
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
  @Transform(({ value }) => plainToClass(FiltersDTO, JSON.parse(value)))
  @ValidateNested()
  @IsOptional()
  filters?: FiltersDTO;

  @Type(() => SortsDTO)
  @Transform(({ value }) => plainToClass(SortsDTO, JSON.parse(value)))
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  sorts?: SortsDTO[];

  @Type(() => PaginationDTO)
  @Transform(({ value }) => plainToClass(PaginationDTO, JSON.parse(value)))
  @ValidateNested()
  @IsOptional()
  pagination?: PaginationDTO;
}
