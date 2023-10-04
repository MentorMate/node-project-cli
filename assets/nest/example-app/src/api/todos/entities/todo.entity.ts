import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '@utils/entities/generic-entity';

export class Todo extends GenericEntity {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty({ default: false })
  completed = false;
}
