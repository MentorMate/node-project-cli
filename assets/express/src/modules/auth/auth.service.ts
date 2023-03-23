import { UsersRepositoryInterface } from '@modules/database';
import {
  JwtServiceInterface,
  Login,
  PasswordService,
  Register,
  Tokens,
} from '@modules';
import { AuthServiceInterface } from './auth.service.interface';

export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly users: UsersRepositoryInterface,
    private readonly jwt: JwtServiceInterface,
    private readonly password: PasswordService
  ) {}

  async register({ email, password }: Register): Promise<Tokens> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
    });

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }

  async login({ email, password }: Login): Promise<Tokens | undefined> {
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
