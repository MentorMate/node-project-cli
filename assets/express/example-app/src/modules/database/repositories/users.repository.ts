import { mapErrors } from '@common/utils';
import { Knex } from 'knex';
import { InsertUser, User } from '../models';
import { first } from '../utils';
import { UserEmailTaken } from './users.error-mappings';
import { UsersRepositoryInterface } from './users.repository.interface';

export class UsersRepository implements UsersRepositoryInterface {
  constructor(private readonly knex: Knex) {}

  async insertOne(input: InsertUser): Promise<User> {
    return await this.knex('users')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(mapErrors(UserEmailTaken));
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.knex('users').where({ email }).first();
  }
}
