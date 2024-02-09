import { sign } from 'jsonwebtoken';
import { Injectable, Inject } from '@nestjs/common';
import { JwtClaims } from '../interfaces';
import { authConfig } from '@utils/environment';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    @Inject(authConfig.KEY) private auth: ConfigType<typeof authConfig>,
  ) {}

  sign(claims: JwtClaims): string {
    return sign(claims, this.auth.JWT_SECRET, {
      expiresIn: this.auth.JWT_EXPIRATION,
    });
  }
}
