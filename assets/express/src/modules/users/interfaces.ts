import { User, CreateUserInput, UpdateUserInput } from '..';
import { ListUsersQuery, Paginated } from '@database';

export interface UserService {
  create: (payload: CreateUserInput) => Promise<User>;
  find: (email: string) => Promise<User | undefined>;
  list: (query: ListUsersQuery) => Promise<Paginated<User>>;
  update: (
    email: string,
    payload: UpdateUserInput
  ) => Promise<User | undefined>;
  delete: (email: string) => Promise<number>;
}
