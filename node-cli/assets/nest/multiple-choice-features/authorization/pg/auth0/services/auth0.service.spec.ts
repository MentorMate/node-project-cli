import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { Auth0User, Credentials } from '../interfaces';
import { Auth0Service } from './auth0.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { authConfig, dbConfig, nodeConfig } from '@utils/environment';

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

describe('Auth0Service', () => {
  let httpService: HttpService;
  let auth0Service: Auth0Service;

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

    auth0Service = module.get<Auth0Service>(Auth0Service);
    httpService = module.get<HttpService>(HttpService);

    auth0Service.logger.warn = jest.fn();
    auth0Service.logger.error = jest.fn();
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  describe('createUser', () => {
    it('when the email is not registered should register the user', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([] as unknown as Auth0User);
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockResolvedValueOnce({ data: auth0User });

      const user = await auth0Service.createUser(
        userCreds.email,
        userCreds.password,
      );

      expect(user).toEqual(auth0User);
    });

    it('throws error when user is already registered', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([auth0User] as unknown as Auth0User);

      await expect(
        auth0Service.createUser(userCreds.email, userCreds.password),
      ).rejects.toThrow(
        new BadRequestException('A user with this email already exists.'),
      );
    });

    it('throws error when auth0 request fails', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([] as unknown as Auth0User);
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.createUser(userCreds.email, userCreds.password),
      ).rejects.toThrow(new BadRequestException());
    });
  });

  it('updateUserMetadata updates metadata', async () => {
    const newMetadata = { data: 'new' };
    jest
      .spyOn(httpService.axiosRef, 'patch')
      .mockResolvedValueOnce({ ...auth0User, user_metadata: newMetadata });

    const user = await auth0Service.updateUserMetadata('1', newMetadata);

    expect(user).toEqual({ ...auth0User, user_metadata: newMetadata });
  });

  describe('searchUsersByEmail', () => {
    it('when the user is found', async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValueOnce({ data: auth0User });

      const user = await auth0Service.searchUsersByEmail(auth0User.email);

      expect(user).toEqual(auth0User);
    });

    it('throws error when user is not found', async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.searchUsersByEmail(auth0User.email),
      ).rejects.toThrow(new BadRequestException());
    });
  });

  describe('searchUsersByEmail', () => {
    it('when user is deleted', async () => {
      jest.spyOn(httpService.axiosRef, 'delete').mockResolvedValueOnce({});

      const response = await auth0Service.deleteUser(auth0User.user_id);

      expect(response).toEqual({});
    });

    it('throws error when auth0 request fails', async () => {
      jest
        .spyOn(httpService.axiosRef, 'delete')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.deleteUser(auth0User.user_id),
      ).rejects.toThrow(new BadRequestException());
    });
  });

  describe('onModuleInit', () => {
    it('when accessToken is set', async () => {
      const tokenResponse = { data: { access_token: 'token' } };
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockResolvedValueOnce(tokenResponse);

      const onModuleInit = jest.spyOn(auth0Service, 'onModuleInit');

      auth0Service.onModuleInit();

      expect(onModuleInit).toHaveBeenCalled();
    });

    it('throws error accessToken is missing', async () => {
      const tokenResponse = { data: {} };
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockResolvedValueOnce(tokenResponse);

      await expect(auth0Service.onModuleInit()).rejects.toThrow(
        new Error('Access token is missing!'),
      );
    });

    it('throws error when axios response is falsy(undefined)', async () => {
      jest.spyOn(httpService.axiosRef, 'post').mockResolvedValueOnce(undefined);

      await expect(auth0Service.onModuleInit()).rejects.toThrow(
        new Error('Access token is missing!'),
      );
    });

    it('throws error when auth0 token request fails', async () => {
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(auth0Service.onModuleInit()).rejects.toThrow(
        new Error('Something went wrong!'),
      );
    });
  });
});
