import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Trim } from '@utils/class-transformers';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  note?: string | null;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean = false;
}
