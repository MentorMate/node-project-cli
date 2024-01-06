import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@utils/class-transformers';
import { IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsOptional()
  @Trim()
  @MinLength(1)
  @MaxLength(255)
  note?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
