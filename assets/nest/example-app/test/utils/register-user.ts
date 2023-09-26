import { JwtToken } from '@api/auth/entities';
import { getUserCredentials } from './get-user-credentials';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export const registerUser = async (
  app: NestFastifyApplication,
  payload = getUserCredentials(),
): Promise<JwtToken> => {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload,
  });
  return JSON.parse(res.body) as JwtToken;
};
