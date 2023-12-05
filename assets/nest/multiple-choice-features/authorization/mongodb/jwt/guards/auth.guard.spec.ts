import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import { Test } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtClaims } from '../interfaces';
import { ObjectId } from 'mongodb';

describe('Auth Guard', () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ConfigService, AuthGuard, Reflector],
    }).compile();

    authGuard = moduleRef.get<AuthGuard>(AuthGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const testClaims: JwtClaims = {
      sub: new ObjectId(100).toString(),
      email: 'admin@admin.com',
    };

    it('should return true if route is public', () => {
      reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
      const mockContext = createMock<ExecutionContext>();
      expect(authGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return true when user is authenticated', () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer testToken',
        },
      });
      jest.spyOn(jwt, 'verify').mockReturnValue(testClaims as never);

      expect(authGuard.canActivate(mockContext)).toBe(true);
    });

    it('should throw an Unauthorized error when user is not authenticated', () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer invalidToken',
        },
      });
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error();
      });

      expect(() => authGuard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });

    it('should throw an Unauthorized error when token is not send', () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      expect(() => authGuard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });
  });
});
