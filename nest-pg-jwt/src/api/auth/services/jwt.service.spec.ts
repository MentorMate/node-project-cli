import { verify } from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { nodeConfig, dbConfig, authConfig } from '@utils/environment';

describe('JwtService', () => {
  const env: { [key: string]: string } = {
    JWT_SECRET: 'very-secret',
    JWT_EXPIRATION: '1d',
  };

  let jwtService: JwtService;

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [nodeConfig, dbConfig, authConfig],
          cache: true,
          ignoreEnvFile: true,
          isGlobal: true,
        }),
      ],
      providers: [
        {
          provide: authConfig.KEY,
          useValue: env,
        },
        JwtService,
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('sign', () => {
    it('should sign the claims returning a JWT token', () => {
      const claims = { sub: '1', email: 'email@example.com' };
      const token = jwtService.sign(claims);
      const payload = verify(token, env.JWT_SECRET);
      expect(payload).toEqual(expect.objectContaining(claims));
    });
  });
});
