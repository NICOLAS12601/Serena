import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { AdminGuard, CurrentAdmin, type AdminRequest } from './admin.guard.js';
import { ChangePasswordDto, LoginDto } from './auth.dto.js';
import { AuthService, type AdminIdentity } from './auth.service.js';
import { SESSION_COOKIE, readCookie } from './session-token.js';

/** httpOnly: page scripts cannot read it. Secure: HTTPS only in production. */
function cookieOptions(expires?: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /auth/login — at most 5 attempts per minute, to stop password guessing.
  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresAt } = await this.auth.login(
      body.email,
      body.password,
    );
    response.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt));
    return { ok: true };
  }

  // POST /auth/logout
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);
    if (token) await this.auth.logout(token);
    response.clearCookie(SESSION_COOKIE, cookieOptions());
    return { ok: true };
  }

  // GET /auth/me — who is logged in (401 if nobody).
  @Get('me')
  @UseGuards(AdminGuard)
  me(@CurrentAdmin() admin: AdminIdentity) {
    return admin;
  }

  // PATCH /auth/password
  @Patch('password')
  @UseGuards(AdminGuard)
  async changePassword(
    @Req() request: AdminRequest,
    @Body() body: ChangePasswordDto,
  ) {
    await this.auth.changePassword(
      request.admin.id,
      body.currentPassword,
      body.newPassword,
      request.sessionToken,
    );
    return { ok: true };
  }
}
