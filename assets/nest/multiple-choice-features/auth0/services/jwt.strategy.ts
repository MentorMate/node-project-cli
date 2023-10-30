import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@utils/environment';
import { Auth0User } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Environment>) {
    const AUTH0_ISSUER_URL = configService.get('AUTH0_ISSUER_URL');
    const AUTH0_AUDIENCE = configService.get('AUTH0_AUDIENCE');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${AUTH0_ISSUER_URL}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: AUTH0_AUDIENCE,
      issuer: `${AUTH0_ISSUER_URL}`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Auth0User): Auth0User {
    return payload;
  }
}
