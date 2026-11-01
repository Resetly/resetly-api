import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IAuthService } from './auth.service.interface';
import { AuthenticatedUser } from '../../common/types';
import { AppConfigService } from '../../config/config.service';

/**
 * Auth scaffold service.
 *
 * TODO: Real authentication provider will plug in here.
 * Decision between Better Auth and Passport+JWT is pending.
 * Password hashing and registration logic will be implemented once provider is chosen.
 */
@Injectable()
export class AuthService implements IAuthService {
  constructor(private readonly configService: AppConfigService) {}

  async validateUser(_credentials: unknown): Promise<AuthenticatedUser | null> {
    // TODO: Implement user lookup and credential verification
    return null;
  }

  async generateAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload = {
      sub: user.userId,
      email: user.email,
    };

    return jwt.sign(payload, this.configService.jwtAccessSecret, {
      expiresIn: this.configService.jwtAccessTtl as `${number}m`,
      algorithm: 'HS256',
    });
  }
}
