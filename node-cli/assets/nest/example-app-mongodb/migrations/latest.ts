import { Collections } from '@database/constants';
import { Db } from 'mongodb';

export async function latest(mongodb: Db) {
  await mongodb.createCollection(Collections.Users);
  await mongodb.createCollection(Collections.Todos);
  await mongodb.createIndex(Collections.Todos, 'user_id');
}
