import { UsersRepositoryInterface } from '@api/users/interfaces';
import { Credentials, JwtTokens } from '../entities';
import {
  AuthServiceInterface,
  JwtServiceInterface,
  PasswordServiceInterface,
} from '../interfaces';
import { Inject, Injectable } from '@nestjs/common';
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
      user.password,
    );

    if (!passwordMatches) {
      return;
    }

    return {
      idToken: this.jwt.sign({ sub: user.id.toString(), email }),
    };
  }
}
