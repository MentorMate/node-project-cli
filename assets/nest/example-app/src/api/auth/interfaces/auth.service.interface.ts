import { Credentials, JwtToken } from '../entities';

export interface AuthServiceInterface {
  register: (credentials: Credentials) => Promise<JwtToken>;
  login: (credentials: Credentials) => Promise<JwtToken | undefined>;
}
