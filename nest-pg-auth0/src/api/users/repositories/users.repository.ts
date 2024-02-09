import { rethrowError } from '@utils/error';
import { User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { Injectable } from '@nestjs/common';
import { NestKnexService } from '@database/nest-knex.service';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(private readonly knex: NestKnexService) {
    super(knex, Tables.Users);
  }

  insertOne(payload: Partial<User>): Promise<User> {
    return this.repository()
      .insert(payload)
      .returning('*')
      .then((data: any) => data[0])
      .catch(rethrowError(UserEmailTaken));
  }

  findByEmail(email: User['email']): Promise<User | undefined> {
    return this.repository().where({ email }).first();
  }

  updateOne(id: number, payload: Partial<User>): Promise<User> {
    return this.repository()
      .where({ id })
      .update(payload)
      .returning('*')
      .then((data: any) => data[0])
  }
}
