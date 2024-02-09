import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '@utils/entities';
import { ObjectId } from 'mongodb';

export class User extends GenericEntity {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  userId: ObjectId;
}
