import { AxiosStatic } from 'axios';
import { Logger } from 'pino';
import { Auth0User } from '../interfaces';
import { Environment } from '@utils/environment';
import createHttpError from 'http-errors';

export class Auth0Service {
  private accessToken = '';
  private baseURL = '';
  private AUTH0_CLIENT_ID = '';
  private AUTH0_CLIENT_SECRET = '';

  constructor(
    private logger: Logger,
    private axios: AxiosStatic,
    private env: Environment
  ) {
    this.baseURL = this.env.AUTH0_ISSUER_URL;
    this.AUTH0_CLIENT_ID = this.env.AUTH0_CLIENT_ID;
    this.AUTH0_CLIENT_SECRET = this.env.AUTH0_CLIENT_SECRET;
  }

  public async getAuth0AccessToken() {
    const response = await this.axios
      .post<{ access_token: string }>(
        `${this.baseURL}oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.AUTH0_CLIENT_ID,
          client_secret: this.AUTH0_CLIENT_SECRET,
          audience: `${this.baseURL}api/v2/`,
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new createHttpError.BadRequest('Something went wrong!');
      });

    if (!response?.data?.access_token) {
      this.logger.error('Access token is missing in the response data');
      throw new createHttpError.BadRequest('Access token is missing!');
    }

    return response.data.access_token;
  }

  private async buildHeaders() {
    const accessToken = this.accessToken || (await this.getAuth0AccessToken());

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  public async createUser(email: string, password: string) {
    const users = await this.searchUsersByEmail(email);
    if (Array.isArray(users) && users.length) {
      throw new createHttpError.BadRequest(
        'A user with this email already exists.'
      );
    }

    const headers = await this.buildHeaders();
    return this.axios
      .post<Auth0User>(
        `${this.baseURL}api/v2/users`,
        {
          email,
          user_metadata: {},
          connection: 'Username-Password-Authentication',
          password,
          verify_email: true,
        },
        { headers }
      )
      .then(({ data }) => data)
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new createHttpError.BadRequest('Something went wrong!');
      });
  }

  public async updateUserMetadata(
    userId: string,
    metadata: Auth0User['user_metadata']
  ) {
    const headers = await this.buildHeaders();
    return this.axios.patch<Auth0User>(
      `${this.baseURL}api/v2/users/${userId}`,
      {
        user_metadata: metadata,
      },
      { headers }
    );
  }

  public async searchUsersByEmail(email: string) {
    const headers = await this.buildHeaders();
    return this.axios
      .get<Auth0User>(`${this.baseURL}api/v2/users-by-email`, {
        params: { email },
        headers,
      })
      .then(({ data }) => data)
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new createHttpError.BadRequest('Something went wrong!');
      });
  }

  public async deleteUser(userId: string) {
    const headers = await this.buildHeaders();
    return this.axios
      .delete<Auth0User>(`${this.baseURL}api/v2/users/${userId}`, {
        headers,
      })
      .catch((error) => {
        this.logger.error(error.response.data);
        throw new createHttpError.BadRequest('Something went wrong!');
      });
  }
}
