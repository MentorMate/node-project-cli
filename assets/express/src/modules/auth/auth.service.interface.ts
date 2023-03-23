import { Register, Login, Tokens } from '..';

export interface AuthServiceInterface {
  register: (payload: Register) => Promise<Tokens>;
  login: (payload: Login) => Promise<Tokens | undefined>;
}
