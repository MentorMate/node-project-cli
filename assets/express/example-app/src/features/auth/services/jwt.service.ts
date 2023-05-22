import jwt from 'jsonwebtoken';
import { Environment } from '@utils/environment';
import { JwtClaims } from '../entities';
import { JwtServiceInterface } from '../interfaces';

export class JwtService implements JwtServiceInterface {
  constructor(
    private readonly env: Pick<Environment, 'JWT_SECRET' | 'JWT_EXPIRATION'>
  ) {}

  sign(claims: JwtClaims): string {
    return jwt.sign(claims, this.env.JWT_SECRET, {
      expiresIn: this.env.JWT_EXPIRATION,
    });
  }
}
