import { rethrowError } from '@utils/error';
import { InsertUser, User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { UsersRepositoryInterface } from '../interfaces';
import { Injectable } from '@nestjs/common';
import { NestKnexService } from '@database/nest-knex.service';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
  constructor(private readonly knex: NestKnexService) {}

  async insertOne(input: InsertUser): Promise<User> {
    return await this.knex
      .connection('users')
      .insert(input)
      .returning('*')
      .then((data: any) => data[0])
      .catch(rethrowError(UserEmailTaken));
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.knex.connection('users').where({ email }).first();
  }
}
