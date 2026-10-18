import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { hashPassword } from './password.js';
import { hashSessionToken } from './session-token.js';

function setup() {
  const prisma = {
    adminUser: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    adminSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  const service = new AuthService(prisma as unknown as PrismaService);
  return { prisma, service };
}

describe('AuthService', () => {
  it('opens a session with the right password and stores only the token hash', async () => {
    const { prisma, service } = setup();
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 1,
      email: 'mica@example.com',
      passwordHash: await hashPassword('una-clave-larga'),
    });

    const { token } = await service.login(
      ' Mica@Example.com ',
      'una-clave-larga',
    );

    expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { email: 'mica@example.com' },
    });
    const stored = prisma.adminSession.create.mock.calls[0][0].data;
    expect(stored.tokenHash).toBe(hashSessionToken(token));
    expect(stored.tokenHash).not.toBe(token);
  });

  it('rejects a wrong password', async () => {
    const { prisma, service } = setup();
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 1,
      email: 'mica@example.com',
      passwordHash: await hashPassword('una-clave-larga'),
    });
    await expect(service.login('mica@example.com', 'otra')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prisma.adminSession.create).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with the same error', async () => {
    const { prisma, service } = setup();
    prisma.adminUser.findUnique.mockResolvedValue(null);
    await expect(service.login('nadie@example.com', 'x')).rejects.toThrow(
      'Email o contraseña incorrectos.',
    );
  });

  it('treats an expired session as logged out and deletes it', async () => {
    const { prisma, service } = setup();
    prisma.adminSession.findUnique.mockResolvedValue({
      id: 7,
      expiresAt: new Date(Date.now() - 1000),
      adminUser: { id: 1, email: 'mica@example.com' },
    });
    expect(await service.validateSession('token')).toBeNull();
    expect(prisma.adminSession.delete).toHaveBeenCalledWith({
      where: { id: 7 },
    });
  });

  it('returns the admin for a valid session', async () => {
    const { prisma, service } = setup();
    prisma.adminSession.findUnique.mockResolvedValue({
      id: 7,
      expiresAt: new Date(Date.now() + 60_000),
      adminUser: { id: 1, email: 'mica@example.com' },
    });
    expect(await service.validateSession('token')).toEqual({
      id: 1,
      email: 'mica@example.com',
    });
  });
});
