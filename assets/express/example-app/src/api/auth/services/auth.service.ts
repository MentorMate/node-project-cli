import { UsersRepositoryInterface } from '@api/users';
import { Credentials, JwtTokens } from '../entities';
import {
  AuthServiceInterface,
  JwtServiceInterface,
  PasswordServiceInterface,
} from '../interfaces';

export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly users: UsersRepositoryInterface,
    private readonly jwt: JwtServiceInterface,
    private readonly password: PasswordServiceInterface
  ) {}

  async register({ email, password }: Credentials): Promise<JwtTokens> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
    });

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }

  async login({
    email,
    password,
  }: Credentials): Promise<JwtTokens | undefined> {
    const user = await this.users.findByEmail(email);

    if (!user) {
      return;
    }

    const passwordMatches = await this.password.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return;
    }

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }
}
