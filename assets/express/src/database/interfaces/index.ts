import { User, UserPayload } from '@entities';

export type UserRepository = {
  getUser: (email: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[] | null>;
  createUser: (payload: UserPayload) => Promise<User | null>;
  updateUser: (payload: UserPayload) =>Promise<User | null>; 
  deleteUser: (email: string) => Promise<boolean>;
}

export type DbCollection = {
  userRepoitory: UserRepository;
  // todoDbLayer: TodosMethods;
};
