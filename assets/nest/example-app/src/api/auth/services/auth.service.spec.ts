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
import { AuthModuleMetadata } from '../auth.module';
import { Credentials } from '../interfaces';

const registeredUser: User = {
  id: 1,
  userId: 'tz4a98xxat96iws9zmbrgj3a',
  createdAt: Date.now().toString(),
  updatedAt: Date.now().toString(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule(
      AuthModuleMetadata,
    ).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    passwordService = module.get<PasswordService>(PasswordService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('register', () => {
    it('when the email is not registered should register the user', async () => {
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(usersRepository, 'insertOne')
        .mockResolvedValueOnce({ ...registeredUser, ...unregisteredCreds });
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
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValueOnce(undefined);

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
