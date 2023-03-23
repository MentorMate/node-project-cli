import jwt from 'jsonwebtoken';
import { Environment } from '@common/environment';
import { Claims } from '@modules';
import { JwtServiceInterface } from './jwt.service.interface';

export class JwtService implements JwtServiceInterface {
  constructor(private readonly env: Environment) {}

  sign(claims: Claims): string {
    return jwt.sign(claims, this.env.JWT_SECRET, {
      expiresIn: this.env.JWT_EXPIRATION,
    });
  }
}
