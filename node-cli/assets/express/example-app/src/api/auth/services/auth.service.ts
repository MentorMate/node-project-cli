import { UsersRepository } from '@api/users';
import { Credentials, JwtTokens } from '../entities';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { createId } from '@paralleldrive/cuid2';
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
    private readonly password: PasswordService
  ) {}

  async register({ email, password }: Credentials): Promise<JwtTokens> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
      userId: createId(),
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
      idToken: this.jwt.sign({ sub: user.userId.toString(), email }),
    };
  }
}
