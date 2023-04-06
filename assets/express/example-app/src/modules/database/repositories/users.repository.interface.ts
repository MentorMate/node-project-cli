import { InsertUser, User } from '../models';

export type UsersRepositoryInterface = {
  insertOne: (input: InsertUser) => Promise<User>;
  findByEmail: (id: User['email']) => Promise<User | undefined>;
};
