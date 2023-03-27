import { JwtClaims } from '@common/data/auth';

export interface JwtServiceInterface {
  sign: (claims: JwtClaims) => string;
}
