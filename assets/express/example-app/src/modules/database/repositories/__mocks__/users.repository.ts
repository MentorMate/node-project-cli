import { DuplicateRecord } from '@modules/database/errors';
import { InsertUser, User } from '../../models';
import { UsersRepositoryInterface } from '../users.repository.interface';

export class UsersRepository implements UsersRepositoryInterface {
  private lastId = 0;
  private records: User[] = [];

  private nextId() {
    return ++this.lastId;
  }

  async insertOne(input: InsertUser): Promise<User> {
    const existingRecord = await this.findByEmail(input.email);

    if (existingRecord) {
      throw new DuplicateRecord('User Email already taken');
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
