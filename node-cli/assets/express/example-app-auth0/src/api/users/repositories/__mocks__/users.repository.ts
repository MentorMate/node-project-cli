import { DuplicateRecordError } from '@database/errors';
import { InsertUser, User } from '../../entities';
import { createId } from '@paralleldrive/cuid2';

export class UsersRepository {
  private records: Partial<User>[] = [];

  async insertOne(input: InsertUser): Promise<Partial<User>> {
    if (!input.email) {
      throw new Error('Email is required');
    }

    const existingRecord = await this.findByEmail(input.email);

    if (existingRecord) {
      throw new DuplicateRecordError('User Email already taken');
    }

    const record = {
      id: createId(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.records.push(record);

    return record;
  }

  async findByEmail(email: string): Promise<Partial<User> | undefined> {
    return this.records.find((r) => r.email === email);
  }
}
