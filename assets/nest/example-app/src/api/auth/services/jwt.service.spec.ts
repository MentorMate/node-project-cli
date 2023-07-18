import { verify } from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@utils/environment';

describe('JwtService', () => {
  const env = {
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  };

  const config = {
    get: (key: keyof typeof env) => env[key],
  } as never as ConfigService<Environment>;
  const jwt = new JwtService(config);

  describe('sign', () => {
    it('should sign the claims returning a JWT token', () => {
      const claims = { sub: '1', email: 'email@example.com' };
      const token = jwt.sign(claims);
      const payload = verify(token, env.JWT_SECRET);
      expect(payload).toEqual(expect.objectContaining(claims));
    });
  });
});
