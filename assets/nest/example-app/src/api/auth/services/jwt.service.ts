import { sign } from 'jsonwebtoken';
import { Environment } from '@utils/environment';
import { JwtClaims } from '../entities';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService<Environment>) {}

  sign(claims: JwtClaims): string {
    return sign(claims, this.configService.get('JWT_SECRET') as string, {
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });
  }
}
