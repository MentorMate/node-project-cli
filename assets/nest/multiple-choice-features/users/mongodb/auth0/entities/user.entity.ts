import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '@utils/entities';

export class User extends GenericEntity {
  @ApiProperty()
  email: string;

  @ApiProperty()
  userId: string;
}
