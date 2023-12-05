import { User } from '@api/users/entities';
import { UsersRepository } from '@api/users/repositories';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModuleMetadata } from '../auth.module';
import { Auth0User, Credentials } from '../interfaces';
import { Auth0Service } from './auth0.service';
import { ObjectId } from 'mongodb';
import { DatabaseService } from '@database/database.service';
import { NEST_MONGO_OPTIONS } from '@database/constants';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

const userCreds: Credentials = {
  email: 'new-email@example.com',
  password: 'very-secret',
};

const registeredUser: User = {
  _id: new ObjectId(1),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  email: userCreds.email,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [...AuthModuleMetadata.controllers],
      imports: [
        HttpModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule,
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

    authService = module.get<AuthService>(AuthService);
    auth0Service = module.get<Auth0Service>(Auth0Service);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    authService.logger.warn = jest.fn();
    authService.logger.error = jest.fn();
  });

  describe('register', () => {
    it('when the email is not registered should register the user', async () => {
      const createdUser = { ...registeredUser, ...userCreds };
      jest.spyOn(auth0Service, 'createUser').mockResolvedValueOnce(auth0User);
      jest
        .spyOn(usersRepository, 'insertOne')
        .mockResolvedValueOnce(createdUser._id);
      jest
        .spyOn(auth0Service, 'updateUserMetadata')
        .mockResolvedValueOnce(auth0User as any);

      const userId = await authService.register(userCreds);

      expect(userId).toEqual(createdUser._id);
    });

    it('throws error when creating a user in the database fails', async () => {
      jest.spyOn(auth0Service, 'createUser').mockResolvedValueOnce(auth0User);
      jest.spyOn(usersRepository, 'insertOne').mockRejectedValueOnce(undefined);
      jest
        .spyOn(auth0Service, 'deleteUser')
        .mockResolvedValueOnce(auth0User as any);

      await expect(authService.register(userCreds)).rejects.toThrowError(
        new BadRequestException('Something went wrong!')
      );
    });
  });
});
