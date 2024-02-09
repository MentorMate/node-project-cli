import { Collections } from '@database/constants';
import { Db } from 'mongodb';

export async function rollback(mongodb: Db) {
  await mongodb.dropCollection(Collections.Todos);
  await mongodb.dropCollection(Collections.Users);
}
