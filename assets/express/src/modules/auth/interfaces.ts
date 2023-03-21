import { CreateUserInput, Login, Tokens } from '..';

export interface AuthService {
  login: (payload: Login) => Promise<Tokens | undefined>;
  register: (payload: CreateUserInput) => Promise<Tokens | undefined>;
}
