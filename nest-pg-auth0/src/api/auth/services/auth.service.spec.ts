import { User } from '@api/users/entities';
import { UsersRepository } from '@api/users/repositories';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { Auth0User, Credentials } from '../interfaces';
import { Auth0Service } from './auth0.service';
import { ConfigModule } from '@nestjs/config';
import { authConfig, dbConfig, nodeConfig } from '@utils/environment';

const userCreds: Credentials = {
  email: 'new-email@example.com',
  password: 'very-secret',
};

const registeredUser: User = {
  id: 1,
  createdAt: Date.now().toString(),
  updatedAt: Date.now().toString(),
  email: userCreds.email,
  password: 'very-secret',
  userId: '1',
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

describe('AuthService', () => {
  let authService: AuthService;
  let auth0Service: Auth0Service;
  let usersRepository: UsersRepository;

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          load: [authConfig, dbConfig, nodeConfig],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    auth0Service = module.get<Auth0Service>(Auth0Service);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    authService.logger.warn = jest.fn();
    authService.logger.error = jest.fn();
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('register', () => {
    it('when the email is not registered should register the user', async () => {
      const createdUser = { ...registeredUser, ...userCreds };
      jest.spyOn(auth0Service, 'createUser').mockResolvedValueOnce(auth0User);
      jest
        .spyOn(usersRepository, 'insertOne')
        .mockResolvedValueOnce(createdUser);
      jest
        .spyOn(auth0Service, 'updateUserMetadata')
        .mockResolvedValueOnce(auth0User as any);

      const user = await authService.register(userCreds);

      expect(user).toEqual(createdUser);
    });

    it('throws error when creating a user in the database fails', async () => {
      jest.spyOn(auth0Service, 'createUser').mockResolvedValueOnce(auth0User);
      jest.spyOn(usersRepository, 'insertOne').mockRejectedValueOnce(undefined);
      jest
        .spyOn(auth0Service, 'deleteUser')
        .mockResolvedValueOnce(auth0User as any);

      await expect(authService.register(userCreds)).rejects.toThrowError(
        new BadRequestException('Something went wrong!'),
      );
    });
  });
});
