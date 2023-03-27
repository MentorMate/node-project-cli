import { Paginated } from '@common/query';
import { Knex } from 'knex';
import { InsertUser, UpdateUser, User } from '../models';
import {
  listUsersFilterMap,
  listUsersMaps,
  ListUsersQuery,
} from '../queries/list-users.query';
import { first, parseCount, extractPagination, handleDbError } from '../utils';
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

  async updateByEmail(
    email: User['email'],
    input: UpdateUser
  ): Promise<User | undefined> {
    if (Object.keys(input).length === 0) {
      return this.findByEmail(email);
    }

    return await this.knex('users')
      .where({ email })
      .update(input)
      .returning('*')
      .then(first)
      .catch(handleDbError);
  }

  async deleteByEmail(email: User['email']): Promise<number> {
    return await this.knex('users').where({ email }).del();
  }

  async list(query: ListUsersQuery): Promise<Paginated<User>> {
    const qb = this.knex('users');

    const data = await qb.clone().list(query, listUsersMaps);

    const total = await qb
      .clone()
      .filter(query.filters, listUsersFilterMap)
      .count()
      .then(parseCount);

    return {
      data: data,
      meta: {
        ...extractPagination(query.pagination),
        total,
      },
    };
  }
}
