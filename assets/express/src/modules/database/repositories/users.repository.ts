import { Knex } from 'knex';
import { InsertUser, User } from '../models';
import { first, handleDbError } from '../utils';
import { UsersRepositoryInterface } from './users.repository.interface';

export class UsersRepository implements UsersRepositoryInterface {
  constructor(private readonly knex: Knex) {}

  async insertOne(input: InsertUser): Promise<User> {
    return await this.knex('users')
      .insert(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.knex('users').where({ email }).first();
  }
}
