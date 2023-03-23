import { UserAttributes } from '@common/data/entities';
import { Insert, Update } from './utils/operations';

export { User } from '@common/data/entities';

export type UserColumns = UserAttributes;

export type InsertUser = Insert<UserColumns>;

export type UpdateUser = Update<UserColumns>;
