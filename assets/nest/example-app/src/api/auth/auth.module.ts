import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService, JwtService, PasswordService } from './services';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@api/users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [JwtService, PasswordService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
