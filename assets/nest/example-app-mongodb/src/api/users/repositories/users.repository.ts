import { rethrowError } from '@utils/error';
import { User } from '../entities';
import { UserEmailTaken } from '../error-mappings';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@database/base-repository.repository';
import { Tables } from '@database/constants';
import { DatabaseService } from '@database/database.service';
import { NullableKeysPartial } from '@utils/interfaces';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(private readonly mongodb: DatabaseService) {
    super(mongodb, Tables.Users);
  }

  insertOne(
    payload: NullableKeysPartial<Pick<User, 'email' | 'password'>>
  ): Promise<ObjectId> {
    const _id = new ObjectId();
    const user = {
      _id,
      ...payload,
      userId: _id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return this.repository()
      .insertOne(user)
      .then((value) => value.insertedId)
      .catch(rethrowError(UserEmailTaken));
  }

  findByEmail(email: User['email']): Promise<NullableKeysPartial<User> | null> {
    return this.repository().findOne({ email });
  }

  updateOne(
    id: ObjectId,
    payload: NullableKeysPartial<User>
  ): Promise<NullableKeysPartial<User> | null> {
    return this.repository().findOneAndUpdate({ id }, payload);
  }
}
