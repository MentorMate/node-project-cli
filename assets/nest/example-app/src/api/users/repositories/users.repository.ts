import { rethrowError } from '@utils/error';
import { User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { Injectable } from '@nestjs/common';
import { NestKnexService } from '@database/nest-knex.service';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';
import { Credentials } from '@api/auth/interfaces';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(private readonly knex: NestKnexService) {
    super(knex, Tables.Users);
  }

  async insertOne(input: Credentials): Promise<User> {
    return await this.repository()
      .insert(input)
      .returning('*')
      .then((data: any) => data[0])
      .catch(rethrowError(UserEmailTaken));
  }

  async findByEmail(email: User['email']): Promise<User | undefined> {
    return await this.repository().where({ email }).first();
  }
}
