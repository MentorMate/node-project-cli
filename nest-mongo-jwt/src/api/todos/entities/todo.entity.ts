import { ApiProperty } from '@nestjs/swagger';
import { ToObjectId } from '@utils/class-transformers';
import { GenericEntity } from '@utils/entities/generic-entity';
import { ObjectId } from 'mongodb';

export class Todo extends GenericEntity {
  @ApiProperty()
  @ToObjectId()
  userId: ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty({ default: false })
  completed = false;
}
