import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppConfigService } from '../../config/config.service';
import { AuthenticatedUser } from '../types';

interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  [key: string]: unknown;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authentication credentials are required to continue');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Authorization header format must be: Bearer <token>');
    }

    try {
      /**
       * TODO: Auth provider integration point.
       * A real auth provider (e.g. Better Auth or Passport+JWT strategy) will be plugged in here.
       * For now, verify HS256 JWT signed with JWT_ACCESS_SECRET.
       */
      const secret = this.configService.jwtAccessSecret;
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      const userId = decoded.sub || decoded.userId;
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload: missing user identifier');
      }

      const user: AuthenticatedUser = {
        userId,
        email: decoded.email,
      };

      // Attach verified user to request
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Your session has expired or is invalid. Please sign in again.',
      );
    }
  }
}
