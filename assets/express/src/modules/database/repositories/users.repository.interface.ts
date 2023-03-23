import { InsertUser, UpdateUser, User } from '../models';
import { ListUsersQuery } from '../queries';
import { Paginated } from '@common/query';

export type UsersRepositoryInterface = {
  insertOne: (input: InsertUser) => Promise<User>;
  findByEmail: (id: User['email']) => Promise<User | undefined>;
  updateByEmail: (
    id: User['email'],
    input: UpdateUser
  ) => Promise<User | undefined>;
  deleteByEmail: (id: User['email']) => Promise<number>;
  list: (query: ListUsersQuery) => Promise<Paginated<User>>;
};
