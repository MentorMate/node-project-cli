import { jwtTokens } from '@common/data/auth';
import { registerUser } from './register-user';

export const getJwtToken = async (
  app: Express.Application,
  jwtTokens: JwtTokens
) => {
  const res = await registerUser(app);

  if (res.body) {
    jwtTokens = res.body;
  }
};
