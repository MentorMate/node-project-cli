import { Environment } from '@common';
import { TokensService } from './interfaces';

export function createTokensService(env: Environment): TokensService {
  const expiration = env.JWT_EXPIRATION ?? '';
  const expiresIn =
    typeof Number(expiration) === 'number' ? Number(expiration) : expiration;

  return {
    getJwtConfig: function () {
      return {
        secret: env.JWT_SECRET ?? '',
        expiresIn,
      };
    },
  };
}
