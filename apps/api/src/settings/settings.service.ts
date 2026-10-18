import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateSettingsDto } from './settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Settings the public site needs. Never includes the address or bank
   * details: those are only sent to a client once a booking exists.
   */
  async findPublic() {
    const settings = await this.prisma.settings.findUniqueOrThrow({
      where: { id: 1 },
      select: {
        depositPercent: true,
        transferDiscountPercent: true,
        transferHoldHours: true,
        minAdvanceHours: true,
        maxAdvanceDays: true,
        neighborhood: true,
        whatsappNumber: true,
      },
    });
    return {
      ...settings,
      // Keep digits only, as wa.me links expect (e.g. "+598 99 123 456" -> "59899123456").
      whatsappNumber: settings.whatsappNumber?.replace(/\D/g, '') || null,
    };
  }

  // ─── Admin ──────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.settings.findUniqueOrThrow({ where: { id: 1 } });
  }

  /** Empty texts are stored as null, so "not set" has a single meaning. */
  update(data: UpdateSettingsDto) {
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value,
      ]),
    );
    return this.prisma.settings.update({ where: { id: 1 }, data: cleaned });
  }
}
