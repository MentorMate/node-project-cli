import { Claims, JwtConfig } from '..';

export interface JwtService {
  getConfig: () => JwtConfig;
  sign: (claims: Claims) => string;
}
