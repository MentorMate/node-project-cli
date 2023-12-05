import { NullableKeysPartial } from '@utils/interfaces';
import { DatabaseService } from './database.service';

export class BaseRepository<Entity extends Record<string, any>> {
  private dbService;

  constructor(
    mongodb: DatabaseService,
    private readonly collectionName: string
  ) {
    this.dbService = mongodb;
  }

  repository() {
    return this.dbService.connection.collection<NullableKeysPartial<Entity>>(
      this.collectionName
    );
  }

  async count(): Promise<number> {
    return await this.repository().estimatedDocumentCount();
  }
}
