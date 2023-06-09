import { JwtClaims } from '../entities';

export interface JwtServiceInterface {
  sign: (claims: JwtClaims) => string;
}
