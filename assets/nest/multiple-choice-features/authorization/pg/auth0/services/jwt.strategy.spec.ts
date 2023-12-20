import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { Auth0User, Credentials } from '../interfaces';
import { ConfigModule } from '@nestjs/config';
import { authConfig, dbConfig, nodeConfig } from '@utils/environment';
import { JwtStrategy } from './jwt.strategy';

const userCreds: Credentials = {
  email: 'new-email@example.com',
  password: 'very-secret',
};

const auth0User: Auth0User = {
  blocked: false,
  created_at: Date.now().toString(),
  email: userCreds.email,
  email_verified: true,
  identities: [],
  name: 'userName',
  nickname: 'userNickname',
  picture: '',
  updated_at: Date.now().toString(),
  user_id: '1',
  user_metadata: {},
};

describe('JWT Strategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [authConfig, dbConfig, nodeConfig],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        AuthModule,
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('validate', () => {
    it('should return the Auth0User', () => {
      const result = jwtStrategy.validate(auth0User);

      expect(result).toEqual(auth0User);
    });
  });
});
