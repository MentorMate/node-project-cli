import { expressjwt as jwt } from 'express-jwt';
import { TokensService } from '@modules';

const exceptionPaths: string[] = ['/v1/auth/login', '/v1/auth/register'];

export const validateAccessToken = function (tokensService: TokensService) {
  const jwtConfig = tokensService.getJwtConfig();

  return jwt({ secret: jwtConfig.secret, algorithms: ['HS256'] }).unless({
    path: exceptionPaths,
  });
};
