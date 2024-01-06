import { UsersRepository } from '@api/users';
import { Logger } from 'pino';
import { Auth0Service } from './auth0.service';
import createHttpError from 'http-errors';
import { Credentials } from '../interfaces';

export class AuthService {
  constructor(
		private logger: Logger,
		private auth0Service: Auth0Service,
		private usersRepository: UsersRepository,
	) {}

  async register({ email, password }: Credentials) {
    const userAuth0 = await this.auth0Service.createUser(email, password);

    const user = await this.usersRepository
      .insertOne({
        email,
        userId: userAuth0.user_id,
      })
      .catch(async (error) => {
        this.logger.warn(
          'Creating a user in the database failed. Proceeding with deleting it in Auth0.'
        );
        this.logger.error(error);

        await this.auth0Service.deleteUser(userAuth0.user_id);

        throw new createHttpError.BadRequest('Something went wrong!');
      });

    await this.auth0Service.updateUserMetadata(userAuth0.user_id, {
      id: user.id,
    });

    return {
      email: user.email,
      userId: user.userId,
    };
  }
}
