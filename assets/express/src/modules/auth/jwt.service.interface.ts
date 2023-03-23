import { Claims } from '..';

export interface JwtServiceInterface {
  sign: (claims: Claims) => string;
}
