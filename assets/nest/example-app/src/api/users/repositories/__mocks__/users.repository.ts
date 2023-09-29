import { DuplicateRecordError } from '@database/errors';
import { InsertUser, User } from '../../entities';
import { UsersRepositoryInterface } from '../../interfaces';

export class UsersRepository implements UsersRepositoryInterface {
  private lastId = 0;
  private records: User[] = [];

  private nextId() {
    return ++this.lastId;
  }

  async insertOne(input: InsertUser): Promise<User> {
    const existingRecord = await this.findByEmail(input.email);

    if (existingRecord) {
      throw new DuplicateRecordError('User Email already taken');
    }

    const record = {
      id: this.nextId(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.records.push(record);

    return record;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.records.find((r) => r.email === email);
  }
}
