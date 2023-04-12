import { Inject, Service } from 'typedi';
import { UsersRepository, UsersRepositoryInterface } from '@modules/database';
import { JwtServiceInterface } from './jwt.service.interface';
import { PasswordServiceInterface } from './password.service.interface';
import { AuthServiceInterface } from './auth.service.interface';
import { JwtTokens, Login, Register } from '@common/data/auth';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';

@Service()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject(() => UsersRepository)
    private readonly users: UsersRepositoryInterface,
    @Inject(() => JwtService)
    private readonly jwt: JwtServiceInterface,
    @Inject(() => PasswordService)
    private readonly password: PasswordServiceInterface
  ) {}

  async register({ email, password }: Register): Promise<JwtTokens> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
    });

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }

  async login({ email, password }: Login): Promise<JwtTokens | undefined> {
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
