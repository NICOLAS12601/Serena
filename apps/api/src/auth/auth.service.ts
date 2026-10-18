import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  SESSION_TTL_MS,
  generateSessionToken,
  hashSessionToken,
} from './session-token.js';

export type AdminIdentity = { id: number; email: string };

// Used when the email does not exist, so a failed login takes the same time
// whether or not the account exists (does not reveal which emails are admins).
const DUMMY_HASH = 'scrypt$00000000000000000000000000000000$' + '0'.repeat(128);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /** Checks the credentials and opens a session. Returns the cookie token. */
  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    const valid = await verifyPassword(
      password,
      admin?.passwordHash ?? DUMMY_HASH,
    );
    if (!admin || !valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.prisma.adminSession.create({
      data: {
        adminUserId: admin.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });
    return { token, expiresAt };
  }

  /** Returns the admin behind a session token, or null if it is invalid or expired. */
  async validateSession(token: string): Promise<AdminIdentity | null> {
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { adminUser: { select: { id: true, email: true } } },
    });
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      await this.prisma.adminSession.delete({ where: { id: session.id } });
      return null;
    }
    return session.adminUser;
  }

  async logout(token: string) {
    await this.prisma.adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  /** Changes the password and closes every other session of this admin. */
  async changePassword(
    adminId: number,
    currentPassword: string,
    newPassword: string,
    currentToken: string,
  ) {
    const admin = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
      throw new UnauthorizedException('La contraseña actual no es correcta.');
    }
    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: adminId },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      this.prisma.adminSession.deleteMany({
        where: {
          adminUserId: adminId,
          NOT: { tokenHash: hashSessionToken(currentToken) },
        },
      }),
    ]);
  }
}
