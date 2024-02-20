import { User } from '@api/users';
import { AuthService } from './auth.service';
import { Auth0User, Credentials } from '../interfaces';

const userCreds: Credentials = {
  email: 'new-email@example.com',
  password: 'very-secret',
};

const registeredUser: User = {
  id: '1',
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
  const logger = {
    warn: jest.fn(),
    error: jest.fn(),
  } as any;

  const auth0Service = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUserMetadata: jest.fn(),
  } as any;

  const usersRepository = {
    insertOne: jest.fn(),
  } as any;

  const authService = new AuthService(logger, auth0Service, usersRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('when the email is not registered should register the user', async () => {
      const createdUser = { ...registeredUser, ...userCreds };
      auth0Service.createUser.mockResolvedValueOnce(auth0User);
      usersRepository.insertOne.mockResolvedValueOnce(createdUser);
      auth0Service.updateUserMetadata.mockResolvedValueOnce(auth0User as any);

      const user = await authService.register(userCreds);

      expect(auth0Service.updateUserMetadata).toHaveBeenCalledWith(auth0User.user_id, {
        id: createdUser.id
      });

      expect(user).toEqual({
        email: userCreds.email,
        userId: auth0User.user_id,
      });
    });

    it('throws error when creating a user in the database fails', async () => {
      auth0Service.createUser.mockResolvedValueOnce(auth0User);
      usersRepository.insertOne.mockRejectedValueOnce({ error: 'error' });
      auth0Service.deleteUser.mockResolvedValueOnce(auth0User as any);

      await expect(authService.register(userCreds)).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalledWith('Creating a user in the database failed. Proceeding with deleting it in Auth0.');
      expect(auth0Service.deleteUser).toHaveBeenCalledWith(auth0User.user_id);

    });
  });
});
