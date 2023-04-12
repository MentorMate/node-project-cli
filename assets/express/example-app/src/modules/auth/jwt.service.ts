import { Inject, Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { ENV } from '@common/di/tokens';
import { Environment } from '@common/environment';
import { JwtClaims } from '@common/data/auth';
import { JwtServiceInterface } from './jwt.service.interface';

@Service()
export class JwtService implements JwtServiceInterface {
  constructor(
    @Inject(ENV)
    private readonly env: Pick<Environment, 'JWT_SECRET' | 'JWT_EXPIRATION'>
  ) {}

  sign(claims: JwtClaims): string {
    return jwt.sign(claims, this.env.JWT_SECRET, {
      expiresIn: this.env.JWT_EXPIRATION,
    });
  }
}
