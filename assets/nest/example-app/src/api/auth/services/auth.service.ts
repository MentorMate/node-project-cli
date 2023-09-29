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
    private readonly password: PasswordServiceInterface,
  ) {}

  async register({ email, password }: Credentials): Promise<JwtToken> {
    const user = await this.users.insertOne({
      email,
      password: await this.password.hash(password),
    });

    return {
      idToken: this.jwt.sign({ sub: user.id, email }),
    };
  }

  async login({ email, password }: Credentials): Promise<JwtToken | undefined> {
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException('Invalid email or password');
    }

    const passwordMatches = await this.password.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnprocessableEntityException('Invalid email or password');
    }

    const token = this.jwt.sign({ sub: user.id, email });

    return {
      idToken: token,
    };
  }
}
