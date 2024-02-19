import { Knex } from 'knex';
import { rethrowError } from '@utils/error';
import { InsertUser, User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { createId } from '@paralleldrive/cuid2';

export class UsersRepository {
  constructor(private readonly knex: Knex) {}

  async insertOne(input: InsertUser): Promise<User> {
    return await this.knex('users')
      .insert({
        id: createId(),
        ...input
      })
      .returning('*')
      .then(([user]) => user)
      .catch(rethrowError(UserEmailTaken));
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.knex('users').where({ email }).first();
  }
}
