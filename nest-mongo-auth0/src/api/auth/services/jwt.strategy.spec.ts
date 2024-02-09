import { Test, TestingModule } from '@nestjs/testing';
import { AuthModuleMetadata } from '../auth.module';
import { Auth0User, Credentials } from '../interfaces';
import { ConfigModule } from '@nestjs/config';
import { authConfig, dbConfig, nodeConfig } from '@utils/environment';
import { JwtStrategy } from './jwt.strategy';
import { NEST_MONGO_OPTIONS } from '@database/constants';
import { DatabaseService } from '@database/database.service';
import { UsersRepository } from '@api/users/repositories';
import { HttpModule } from '@nestjs/axios';

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
        HttpModule,
        ConfigModule.forRoot({
          load: [authConfig, dbConfig, nodeConfig],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
      ],
      providers: [
        ...AuthModuleMetadata.providers,
        {
          provide: NEST_MONGO_OPTIONS,
          useValue: {
            urlString: 'mongodb://mock-host',
            databaseName: 'test',
            clientOptions: {},
            migrationsDir: '../../migrations',
            seedsDir: './seeds/test',
          },
        },
        DatabaseService,
        UsersRepository,
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
