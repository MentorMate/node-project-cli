import { InsertUser, User } from '../entities';

export interface UsersRepositoryInterface {
  insertOne: (input: InsertUser) => Promise<User>;
  findByEmail: (email: User['email']) => Promise<User | undefined>;
}
