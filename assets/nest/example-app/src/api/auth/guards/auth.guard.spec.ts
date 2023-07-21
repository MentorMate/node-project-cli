import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import jwt from 'jsonwebtoken';
import { JwtClaims } from '../entities';

describe('AuthenticatedGuard', () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    authGuard = new AuthGuard(new ConfigService(), reflector);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const testClaims: JwtClaims = {
      sub: '1',
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
        UnauthorizedException,
      );
    });

    it('should throw an Unauthorized error when token is not send', () => {
      const mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      expect(() => authGuard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
