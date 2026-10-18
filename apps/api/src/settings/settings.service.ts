import { BadRequestException, Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { normalizeMobile } from '../common/phone.js';
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
    if (typeof cleaned.whatsappNumber === 'string') {
      const phone = normalizeMobile(cleaned.whatsappNumber);
      if (!phone) {
        throw new BadRequestException(
          'El WhatsApp no parece un celular válido. Usá el formato 099 123 456 o, si es de otro país, +código de país y número.',
        );
      }
      cleaned.whatsappNumber = phone;
    }
    if (typeof cleaned.notificationEmail === 'string') {
      const email = cleaned.notificationEmail.trim().toLowerCase();
      if (!isEmail(email)) {
        throw new BadRequestException(
          'El email para avisos no parece válido. Revisalo, por ejemplo nombre@gmail.com.',
        );
      }
      cleaned.notificationEmail = email;
    }
    return this.prisma.settings.update({ where: { id: 1 }, data: cleaned });
  }
}
