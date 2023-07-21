import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@utils/decorators/public.decorator';
import { Environment } from '@utils/environment';
import { Request } from 'express-jwt';
import { verify } from 'jsonwebtoken';
import { JwtClaims } from '../entities';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<Environment>,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Early return if the route is public
    if (this.isPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { sub, email } = verify(
        token,
        this.configService.get('JWT_SECRET') as string,
      ) as Partial<JwtClaims>;
      request.user = { sub, email } as JwtClaims;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
