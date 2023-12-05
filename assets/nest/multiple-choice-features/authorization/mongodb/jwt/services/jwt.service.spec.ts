import { verify } from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ObjectId } from 'mongodb';

describe('JwtService', () => {
  const env: { [key: string]: string } = {
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  };

  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useFactory: () => ({
            get: (key: string) => env[key],
          }),
        },
        JwtService,
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('sign', () => {
    it('should sign the claims returning a JWT token', () => {
      const claims = {
        sub: new ObjectId(1).toString(),
        email: 'email@example.com',
      };
      const token = jwtService.sign(claims);
      const payload = verify(token, env.JWT_SECRET);
      expect(payload).toEqual(
        expect.objectContaining({
          email: claims.email,
          sub: claims.sub.toString(),
        })
      );
    });
  });
});
