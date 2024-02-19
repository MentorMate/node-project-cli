import { DuplicateRecordError } from '@database/errors';
import { InsertUser, User } from '../../entities';
import { createId } from '@paralleldrive/cuid2';

export class UsersRepository {
  private records: User[] = [];

  async insertOne(input: InsertUser): Promise<User> {
    const existingRecord = await this.findByEmail(input.email);

    if (existingRecord) {
      throw new DuplicateRecordError('User Email already taken');
    }

    const record = {
      id: createId(),
      ...input,
      password: input.password || null,
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
