import { Update } from '@database/operations';
import { User } from './user.entity';

export type UpdateUser = Update<Pick<User, 'email' | 'password'>>;
