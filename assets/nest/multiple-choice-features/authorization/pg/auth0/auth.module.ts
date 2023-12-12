import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { UsersModule } from '@api/users/users.module';
import { Auth0Service, AuthService, JwtStrategy } from './services';

export const AuthModuleMetadata = {
  controllers: [AuthController],
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    AuthGuard,
    Auth0Service,
    AuthService,
  ],
};

@Module(AuthModuleMetadata)
export class AuthModule {}
