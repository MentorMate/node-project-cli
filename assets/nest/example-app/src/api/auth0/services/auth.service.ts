import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CredentialsDto } from '../dto';
import { UsersRepository } from '@api/users/repositories';
import { Auth0Service } from './auth0.service';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private usersRepository: UsersRepository,
    private auth0Service: Auth0Service
  ) {}

  async register({ email, password }: CredentialsDto) {
    const userAuth0 = await this.auth0Service.createUser(email, password);

    const user = await this.usersRepository.insertOne(
      email,
      null,
      userAuth0.user_id
    ).catch(async (error) => {
      this.logger.warn('Creating a user in the database failed. Proceeding with deleting it in Auth0.');
      this.logger.error(error);

      await this.auth0Service.deleteUser(userAuth0.user_id);

      throw new BadRequestException('Something went wrong!');
    });

    await this.auth0Service.updateUserMetadata(userAuth0.user_id, {
      id: user.id,
    });

    return user;
  }
}
