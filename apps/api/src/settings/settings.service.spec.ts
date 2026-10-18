import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from './settings.service.js';

function serviceWith(row: Record<string, unknown>) {
  const findUniqueOrThrow = vi.fn().mockResolvedValue(row);
  const prisma = {
    settings: { findUniqueOrThrow },
  } as unknown as PrismaService;
  return { service: new SettingsService(prisma), findUniqueOrThrow };
}

describe('SettingsService.findPublic', () => {
  it('never selects the address or bank details', async () => {
    const { service, findUniqueOrThrow } = serviceWith({
      whatsappNumber: null,
    });
    await service.findPublic();
    const { select } = findUniqueOrThrow.mock.calls[0][0];
    expect(select.address).toBeUndefined();
    expect(select.bankDetails).toBeUndefined();
  });

  it('keeps only the digits of the WhatsApp number', async () => {
    const { service } = serviceWith({ whatsappNumber: '+598 99 123-456' });
    expect((await service.findPublic()).whatsappNumber).toBe('59899123456');
  });

  it('returns null when no number is loaded', async () => {
    const { service } = serviceWith({ whatsappNumber: '' });
    expect((await service.findPublic()).whatsappNumber).toBeNull();
  });
});
