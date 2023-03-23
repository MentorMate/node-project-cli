import jwt from 'jsonwebtoken';
import { Environment } from '@common/environment';
import { JwtService } from './interfaces';
import { Claims } from '@modules';

export function createJwtService(env: Environment): JwtService {
  const expiration = env.JWT_EXPIRATION ?? '';
  const expiresIn =
    typeof Number(expiration) === 'number' ? Number(expiration) : expiration;

  return {
    getConfig() {
      return {
        secret: env.JWT_SECRET ?? '',
        expiresIn,
      };
    },

    sign(claims: Claims) {
      const config = this.getConfig();

      return jwt.sign(claims, config.secret, {
        // algorithm (default: HS256)
        expiresIn: config.expiresIn,
      });
    },
  };
}
