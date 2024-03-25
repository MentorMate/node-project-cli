import { Insert } from '@database/operations';
import { User } from './user.entity';

export type InsertUser = Insert<
  Pick<User, 'email' | 'password' | 'userId'> & { id?: string }
>;
