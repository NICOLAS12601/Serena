import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AdminIdentity } from './auth.service.js';
import { SESSION_COOKIE, readCookie } from './session-token.js';

/** Request after AdminGuard ran: who is logged in and with which token. */
export type AdminRequest = Request & {
  admin: AdminIdentity;
  sessionToken: string;
};

/**
 * Protects admin routes: only requests with a valid session cookie pass.
 * Use with `@UseGuards(AdminGuard)` on a controller or route.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);
    const admin = token ? await this.auth.validateSession(token) : null;
    if (!token || !admin) {
      throw new UnauthorizedException('Tenés que iniciar sesión.');
    }
    request.admin = admin;
    request.sessionToken = token;
    return true;
  }
}

/** `@CurrentAdmin() admin` in a guarded route handler. */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AdminRequest>().admin,
);
