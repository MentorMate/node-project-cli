import { NullableKeysPartial } from '@utils/interfaces';
import { SortOrder } from '@utils/query';
import { Collection, Filter, WithId } from 'mongodb';
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

  where(
    collection: Collection<Entity>,
    value: Partial<Entity>,
    column: keyof WithId<Entity>
  ) {
    const filter = {
      [column]: value,
    } as Filter<Entity>;
    const cursor = collection.find(filter);

    return cursor.toArray();
  }

  whereLike(
    collection: Collection<Entity>,
    value: Partial<Entity>,
    column: keyof WithId<Entity>
  ) {
    const filter = {
      [column]: { $regex: `%${value}%` },
    } as Filter<Entity>;

    const cursor = collection.find(filter);

    return cursor.toArray();
  }

  orderBy(
    collection: Collection<Entity>,
    order: SortOrder,
    column: keyof WithId<Entity>
  ) {
    const direction = order === SortOrder.Asc ? 1 : -1;

    return collection.find().sort(String(column), direction);
  }
}
