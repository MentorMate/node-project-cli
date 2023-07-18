import { Credentials, JwtTokens } from '../entities';

export interface AuthServiceInterface {
  register: (credentials: Credentials) => Promise<JwtTokens>;
  login: (credentials: Credentials) => Promise<JwtTokens | undefined>;
}
