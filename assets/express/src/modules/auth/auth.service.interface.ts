import { JwtTokens, Login, Register } from '@common/data/auth';

export interface AuthServiceInterface {
  register: (payload: Register) => Promise<JwtTokens>;
  login: (payload: Login) => Promise<JwtTokens | undefined>;
}
