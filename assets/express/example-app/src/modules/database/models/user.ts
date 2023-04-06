import { UserAttributes } from '@common/data/models';
import { Insert, Update } from './utils/operations';

export { User } from '@common/data/models';

export type UserColumns = UserAttributes;

export type InsertUser = Insert<UserColumns>;

export type UpdateUser = Update<UserColumns>;
