import { verify } from 'jsonwebtoken';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  const env = {
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  };

  const jwt = new JwtService(env);

  describe('sign', () => {
    it('should sign the claims returning a JWT token', () => {
      const claims = { sub: '1', email: 'email@example.com' };
      const token = jwt.sign(claims);
      const payload = verify(token, env.JWT_SECRET);
      expect(payload).toEqual(expect.objectContaining(claims));
    });
  });
});
