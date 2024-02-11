import { Insert } from '@database/operations';
import { User } from './user.entity';

export type InsertUser = Insert<Partial<User>>;
