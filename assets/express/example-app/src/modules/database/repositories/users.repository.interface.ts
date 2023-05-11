import { InsertUser, User } from '../models';

export interface UsersRepositoryInterface {
  insertOne: (input: InsertUser) => Promise<User>;
  findByEmail: (id: User['email']) => Promise<User | undefined>;
}
