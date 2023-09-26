import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService, JwtService, PasswordService } from './services';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@api/users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';

export const AuthModuleMetadata = {
  imports: [ConfigModule, UsersModule],
  providers: [
    JwtService,
    PasswordService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
};

@Module(AuthModuleMetadata)
export class AuthModule {}
