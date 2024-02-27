import { ApiProperty } from '@nestjs/swagger';

export class GenericEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
