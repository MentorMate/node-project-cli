import { Knex } from 'knex';
import { rethrowError } from '@utils/error';
import { InsertUser, User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { UsersRepositoryInterface } from '../interfaces';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async insertOne(input: InsertUser): Promise<User> {
    return await this.knex('users')
      .insert(input)
      .returning('*')
      .then(([user]) => user)
      .catch(rethrowError(UserEmailTaken));
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.knex('users').where({ email }).first();
  }
}
