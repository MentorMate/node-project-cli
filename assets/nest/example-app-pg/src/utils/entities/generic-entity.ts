import { ApiProperty } from '@nestjs/swagger';

export class GenericEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
