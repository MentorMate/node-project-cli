import { UsersRepositoryInterface } from '@api/users/interfaces';
import { Credentials, JwtToken } from '../entities';
import {
  AuthServiceInterface,
  JwtServiceInterface,
  PasswordServiceInterface,
} from '../interfaces';
import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from '@api/users/repositories';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject(UsersRepository)
    private readonly users: UsersRepositoryInterface,
    @Inject(JwtService)
    private readonly jwt: JwtServiceInterface,
    @Inject(PasswordService)
    private readonly password: PasswordServiceInterface
  ) {}

  async register({ email, password }: Credentials): Promise<JwtToken> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
    });

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }

  async login({ email, password }: Credentials): Promise<JwtToken | undefined> {
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

    const token = this.jwt.sign({ sub: user.id.toString(), email });

    if (!token) {
      throw new UnprocessableEntityException('Invalid email or password');
    }

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }
}
