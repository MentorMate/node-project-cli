import { getUserCredentials } from './get-user-credentials';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export const registerUser = async (
  app: NestFastifyApplication,
  payload = getUserCredentials(),
) => {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload,
  });
  return res.body;
};
