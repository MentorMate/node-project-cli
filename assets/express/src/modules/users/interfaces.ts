import { User, CreateUserInput, UpdateUserInput } from '..';
import { ListUsersQuery, Paginated } from '@database';

export interface UserService {
  create: (payload: CreateUserInput) => Promise<User | undefined>;
  find: (email: string) => Promise<User | undefined>;
  list: (query: ListUsersQuery) => Promise<Paginated<User> | undefined>;
  update: (
    email: string,
    payload: UpdateUserInput
  ) => Promise<User | undefined>;
  delete: (email: string) => Promise<number>;
}
