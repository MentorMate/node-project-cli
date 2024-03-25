import { AxiosStatic } from 'axios';
import { Auth0User, Credentials } from '../interfaces';
import { Auth0Service } from './auth0.service';
import { Logger } from 'pino';
import { Environment } from '@utils/environment';

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
  let auth0Service: Auth0Service;
  let axios: AxiosStatic;
  let logger: Logger;
  let env: Environment;

  beforeAll(() => {
    logger = { error: jest.fn() } as any;
    axios = {
      post: jest.fn(),
      patch: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    } as any;
    env = {} as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    beforeEach(() => {
      auth0Service = new Auth0Service(logger, axios, env);
      jest
        .spyOn(auth0Service, 'getAuth0AccessToken')
        .mockResolvedValue('token');
    });

    it('when the email is not registered should register the user', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([] as unknown as Auth0User);
      jest
        .spyOn(axios, 'post')
        .mockResolvedValueOnce(Promise.resolve({ data: auth0User }));

      const user = await auth0Service.createUser(
        userCreds.email,
        userCreds.password
      );

      expect(user).toEqual(auth0User);
    });

    it('throws error when user is already registered', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([auth0User] as unknown as Auth0User);

      await expect(
        auth0Service.createUser(userCreds.email, userCreds.password)
      ).rejects.toThrow(new Error('A user with this email already exists.'));
    });

    it('throws error when auth0 request fails', async () => {
      jest
        .spyOn(auth0Service, 'searchUsersByEmail')
        .mockResolvedValueOnce([] as unknown as Auth0User);
      jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.createUser(userCreds.email, userCreds.password)
      ).rejects.toThrow();
    });
  });

  describe('updateUserMetadata', () => {
    beforeEach(() => {
      auth0Service = new Auth0Service(logger, axios, env);
      jest
        .spyOn(auth0Service, 'getAuth0AccessToken')
        .mockResolvedValue('token');
    });

    it('should updateUserMetadata updates metadata', async () => {
      const newMetadata = { data: 'new' };
      jest
        .spyOn(axios, 'patch')
        .mockResolvedValueOnce({ ...auth0User, user_metadata: newMetadata });

      const user = await auth0Service.updateUserMetadata('1', newMetadata);

      expect(user).toEqual({ ...auth0User, user_metadata: newMetadata });
    });
  });

  describe('searchUsersByEmail', () => {
    beforeEach(() => {
      auth0Service = new Auth0Service(logger, axios, env);
      jest
        .spyOn(auth0Service, 'getAuth0AccessToken')
        .mockResolvedValue('token');
    });

    it('when the user is found', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: auth0User });

      const user = await auth0Service.searchUsersByEmail(auth0User.email);

      expect(user).toEqual(auth0User);
    });

    it('throws error when user is not found', async () => {
      jest
        .spyOn(axios, 'get')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.searchUsersByEmail(auth0User.email)
      ).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      auth0Service = new Auth0Service(logger, axios, env);
      jest
        .spyOn(auth0Service, 'getAuth0AccessToken')
        .mockResolvedValue('token');
    });

    it('when user is deleted', async () => {
      jest.spyOn(axios, 'delete').mockResolvedValueOnce({});

      const response = await auth0Service.deleteUser(auth0User.user_id);

      expect(response).toEqual({});
    });

    it('throws error when auth0 request fails', async () => {
      jest
        .spyOn(axios, 'delete')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(
        auth0Service.deleteUser(auth0User.user_id)
      ).rejects.toThrow();
    });
  });

  describe('getAuth0AccessToken', () => {
    beforeEach(() => {
      auth0Service = new Auth0Service(logger, axios, env);
    });

    it('when accessToken is set', async () => {
      const tokenResponse = { data: { access_token: 'token' } };
      jest.spyOn(axios, 'post').mockResolvedValueOnce(tokenResponse);

      auth0Service.getAuth0AccessToken();

      // expect(onModuleInit).toHaveBeenCalled();
    });

    it('throws error accessToken is missing', async () => {
      const tokenResponse = { data: {} };
      jest.spyOn(axios, 'post').mockResolvedValueOnce(tokenResponse);

      await expect(auth0Service.getAuth0AccessToken()).rejects.toThrow(
        new Error('Access token is missing!')
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Access token is missing in the response data'
      );
    });

    it('throws error when axios response is falsy(undefined)', async () => {
      jest.spyOn(axios, 'post').mockResolvedValueOnce(undefined);

      await expect(auth0Service.getAuth0AccessToken()).rejects.toThrow(
        new Error('Access token is missing!')
      );
    });

    it('throws error when auth0 token request fails', async () => {
      jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: {} } });

      await expect(auth0Service.getAuth0AccessToken()).rejects.toThrow(
        new Error('Something went wrong!')
      );
    });
  });
});
