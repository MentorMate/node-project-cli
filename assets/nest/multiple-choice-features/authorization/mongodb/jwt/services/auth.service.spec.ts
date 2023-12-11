import { User } from '@api/users/entities';
import { UsersRepository } from '@api/users/repositories';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Credentials } from '../interfaces';
import { ObjectId } from 'mongodb';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../guards';
import { AuthController } from '../auth.controller';
import { NEST_MONGO_OPTIONS } from '@database/constants';
import { DatabaseService } from '@database/database.service';
import { authConfig, dbConfig, nodeConfig } from '@utils/environment';

const registeredUser: User = {
  _id: new ObjectId(100),
  userId: new ObjectId(100),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  email: 'registered-email@example.com',
  password: 'very-secret',
};

const unregisteredCreds: Credentials = {
  email: 'new-email@example.com',
  password: 'very-secret',
};

const registeredCreds: Credentials = {
  email: 'registered@email.com',
  password: 'very-secret',
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let passwordService: PasswordService;
  let usersRepository: UsersRepository;

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [nodeConfig, dbConfig, authConfig],
          ignoreEnvFile: true,
          isGlobal: true,
        }),
      ],
      providers: [
        JwtService,
        PasswordService,
        AuthService,
        {
          provide: APP_GUARD,
          useExisting: AuthGuard,
        },
        AuthGuard,
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
      controllers: [AuthController],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    passwordService = module.get<PasswordService>(PasswordService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('register', () => {
    it('when the email is not registered should register the user', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest
        .spyOn(usersRepository, 'insertOne')
        .mockResolvedValueOnce(registeredUser._id);
      jest
        .spyOn(usersRepository, 'updateOne')
        .mockResolvedValueOnce({ ...registeredUser, ...unregisteredCreds });
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('jwtTokenValue');

      const response = await authService.register(unregisteredCreds);

      expect(response.idToken).toBe('jwtTokenValue');
    });

    it('when the email is already registered should throw an error', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValueOnce(registeredUser);

      await expect(
        authService.register({
          email: registeredUser.email,
          password: registeredUser.password!,
        }),
      ).rejects.toThrowError(new ConflictException('User email already taken'));
    });
  });

  describe('login', () => {
    it('when the email is not registered should throw an error', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.login(unregisteredCreds)).rejects.toThrowError(
        new UnprocessableEntityException('Invalid email or password'),
      );
    });

    it('when the email is registered and the password does not match should return an error', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValueOnce(registeredUser);

      jest.spyOn(passwordService, 'compare').mockResolvedValueOnce(false);

      await expect(authService.login(registeredCreds)).rejects.toThrowError(
        new UnprocessableEntityException('Invalid email or password'),
      );
    });

    it('when the email is registered and the email and password are valid should log the user', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValueOnce(registeredUser);

      jest.spyOn(passwordService, 'compare').mockResolvedValueOnce(true);

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('jwtTokenValue');

      const response = await authService.login(registeredCreds);

      expect(response.idToken).toBe('jwtTokenValue');
    });
  });
});
