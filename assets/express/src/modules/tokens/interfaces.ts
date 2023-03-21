import { JwtConfig } from '..';

export interface TokensService {
  getJwtConfig: () => JwtConfig;
}
