import { ApiProperty } from '@nestjs/swagger';
import { JwtToken } from '../entities';

export class JwtTokensDto implements JwtToken {
  @ApiProperty()
  idToken: string;
}
