import { rethrowError } from '@utils/error';
import { User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { Injectable } from '@nestjs/common';
import { NestKnexService } from '@database/nest-knex.service';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(knex: NestKnexService) {
    super(knex, Tables.Users);
  }

  async insertOne(payload: Partial<User>): Promise<User> {
    return await this.repository()
      .insert({
        id: createId(),
        ...payload,
      })
      .returning('*')
      .then((data: any) => data[0])
      .catch(rethrowError(UserEmailTaken));
  }

  findByEmail(email: User['email']): Promise<User | undefined> {
    return this.repository().where({ email }).first();
  }

  updateOne(id: string, payload: Partial<User>): Promise<User> {
    return this.repository()
      .where({ id })
      .update(payload)
      .returning('*')
      .then((data: any) => data[0]);
  }
}
