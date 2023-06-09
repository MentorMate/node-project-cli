import { ApiProperty } from '@nestjs/swagger';
import { JwtTokens } from '../entities';

export class JwtTokensDto implements JwtTokens {
  @ApiProperty()
  idToken: string;
}
