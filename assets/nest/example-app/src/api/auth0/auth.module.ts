import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@api/users/users.module';
import { ConfigModule } from '@nestjs/config';

export const AuthModuleMetadata = {
  controllers: [
    AuthController
  ],
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    ConfigModule
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    AuthGuard,
    AuthService,
  ],
};

@Module(AuthModuleMetadata)
export class AuthModule {}
