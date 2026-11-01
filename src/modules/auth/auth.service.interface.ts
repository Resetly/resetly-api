import { AuthenticatedUser } from '../../common/types';

export interface IAuthService {
  /**
   * Validates credentials and returns an authenticated user with an access token.
   * To be implemented once auth provider (Better Auth vs Passport+JWT) is finalized.
   */
  validateUser(credentials: unknown): Promise<AuthenticatedUser | null>;

  /**
   * Generates a signed JWT access token for the given user.
   */
  generateAccessToken(user: AuthenticatedUser): Promise<string>;
}
