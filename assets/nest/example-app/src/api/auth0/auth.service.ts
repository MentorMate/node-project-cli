import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CredentialsDto } from './dto';
import { UsersRepository } from '@api/users/repositories';
import { Auth0User } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@utils/environment';

@Injectable()
export class AuthService {
  private AUTH0_ISSUER_URL = this.configService.get('AUTH0_ISSUER_URL');
  private AUTH0_CLIENT_ID = this.configService.get('AUTH0_CLIENT_ID');
  private AUTH0_CLIENT_SECRET = this.configService.get('AUTH0_CLIENT_SECRET');

  constructor(
    private readonly httpService: HttpService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService<Environment>
  ) {}

  private buildAuth0Headers(accessToken: string) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private async getAuth0AccessToken() {
    const response = await this.httpService.axiosRef
      .post<{ access_token: string }>(
        `${this.AUTH0_ISSUER_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.AUTH0_CLIENT_ID!,
          client_secret: this.AUTH0_CLIENT_SECRET!,
          audience: `${this.AUTH0_ISSUER_URL}/api/v2/`,
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .catch(() => {
        throw new Error('Something went wrong!');
      });

    if (!response) {
      throw new BadRequestException();
    }

    return response.data.access_token;
  }

  private async createUserAuth0(
    email: string,
    password: string,
    accessToken: string
  ) {
    const { data } = await this.httpService.axiosRef.post<Auth0User>(
      `${process.env.AUTH0_ISSUER_URL}/api/v2/users`,
      {
        email,
        user_metadata: {},
        connection: 'Username-Password-Authentication',
        password,
        verify_email: true,
      },
      { headers: this.buildAuth0Headers(accessToken) }
    );

    return data;
  }

  private async updateAuth0UserMetadata(
    userId: string,
    accessToken: string,
    metadata: Auth0User['user_metadata']
  ) {
    await this.httpService.axiosRef.patch<Auth0User>(
      `${process.env.AUTH0_ISSUER_URL}/api/v2/users/${userId}`,
      {
        user_metadata: metadata,
      },
      { headers: this.buildAuth0Headers(accessToken) }
    );
  }

  async register({ email, password }: CredentialsDto) {
    const accessToken = await this.getAuth0AccessToken();

    const userAuth0 = await this.createUserAuth0(email, password, accessToken);

    const user = await this.usersRepository.insertOne(
      email,
      null,
      userAuth0.user_id
    );

    await this.updateAuth0UserMetadata(userAuth0.user_id, accessToken, {
      id: user.id,
    });

    return user;
  }
}
