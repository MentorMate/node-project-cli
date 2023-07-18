import { ApiProperty } from '@nestjs/swagger';
import { Credentials } from '../entities';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LowerCase, Trim } from '@utils/class-transformers';

export class CredentialsDto implements Credentials {
  @ApiProperty({ example: 'john@mail.com' })
  @Trim()
  @LowerCase()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'MyS3cr37Pass' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;
}
