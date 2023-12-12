import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { authConfig } from '@utils/environment';
import { Auth0User } from '../interfaces';

@Injectable()
export class Auth0Service implements OnModuleInit {
  public logger = new Logger('Auth0Service');

  private accessToken = '';
  private baseURL = this.auth.AUTH0_ISSUER_URL;
  private auth0ClientId = this.auth.AUTH0_CLIENT_ID;
  private auth0ClientSecret = this.auth.AUTH0_CLIENT_SECRET;

  constructor(
    private httpService: HttpService,
    @Inject(authConfig.KEY)
    private auth: ConfigType<typeof authConfig>,
  ) {}

  onModuleInit() {
    return this.getAuth0AccessToken()
      .then((token) => {
        this.accessToken = token;
      })
      .catch((err) => {
        throw err;
      });
  }

  private async getAuth0AccessToken() {
    const response = await this.httpService.axiosRef
      .post<{ access_token: string }>(
        `${this.baseURL}oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.auth0ClientId,
          client_secret: this.auth0ClientSecret,
          audience: `${this.baseURL}api/v2/`,
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new Error('Something went wrong!');
      });

    if (!response?.data?.access_token) {
      this.logger.error('Access token is missing in the response data');
      throw new Error('Access token is missing!');
    }

    return response.data.access_token;
  }

  private buildHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  public async createUser(email: string, password: string) {
    const users = await this.searchUsersByEmail(email);
    if (Array.isArray(users) && users.length) {
      throw new BadRequestException('A user with this email already exists.');
    }

    return this.httpService.axiosRef
      .post<Auth0User>(
        `${this.baseURL}api/v2/users`,
        {
          email,
          user_metadata: {},
          connection: 'Username-Password-Authentication',
          password,
          verify_email: true,
        },
        { headers: this.buildHeaders() },
      )
      .then(({ data }) => data)
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new BadRequestException();
      });
  }

  public updateUserMetadata(
    userId: string,
    metadata: Auth0User['user_metadata'],
  ) {
    return this.httpService.axiosRef.patch<Auth0User>(
      `${this.baseURL}api/v2/users/${userId}`,
      {
        user_metadata: metadata,
      },
      { headers: this.buildHeaders() },
    );
  }

  public searchUsersByEmail(email: string) {
    return this.httpService.axiosRef
      .get<Auth0User>(`${this.baseURL}api/v2/users-by-email`, {
        params: { email },
        headers: this.buildHeaders(),
      })
      .then(({ data }) => data)
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new BadRequestException();
      });
  }

  public deleteUser(userId: string) {
    return this.httpService.axiosRef
      .delete<Auth0User>(`${this.baseURL}api/v2/users/${userId}`, {
        headers: this.buildHeaders(),
      })
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new BadRequestException();
      });
  }
}
