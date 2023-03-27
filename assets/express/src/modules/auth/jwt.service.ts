import jwt from 'jsonwebtoken';
import { Environment } from '@common/environment';
import { JwtServiceInterface } from './jwt.service.interface';
import { JwtClaims } from '@common/data/auth';

export class JwtService implements JwtServiceInterface {
  constructor(private readonly env: Environment) {}

  sign(claims: JwtClaims): string {
    return jwt.sign(claims, this.env.JWT_SECRET, {
      expiresIn: this.env.JWT_EXPIRATION,
    });
  }
}
