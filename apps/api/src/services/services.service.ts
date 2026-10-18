import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateServiceDto, UpdateServiceDto } from './service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Active services in display order, with public fields only. */
  findActive() {
    return this.prisma.service.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        price: true,
        imageUrl: true,
        icon: true,
        isFirstVisit: true,
      },
    });
  }

  // ─── Admin ──────────────────────────────────────────────────────────────

  /** Every service, including inactive ones, with how many bookings it has. */
  findAllForAdmin() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { bookings: true } } },
    });
  }

  create(data: CreateServiceDto) {
    return this.prisma.service.create({ data });
  }

  async update(id: number, data: UpdateServiceDto) {
    await this.findOrFail(id);
    return this.prisma.service.update({ where: { id }, data });
  }

  /**
   * Only services without bookings can be deleted; the others keep the
   * booking history intact and are deactivated instead.
   */
  async remove(id: number) {
    const service = await this.findOrFail(id);
    const bookings = await this.prisma.booking.count({
      where: { serviceId: id },
    });
    if (bookings > 0) {
      throw new ConflictException(
        `"${service.name}" tiene reservas, así que no se puede borrar. Desactivalo para que deje de aparecer en el sitio.`,
      );
    }
    await this.prisma.service.delete({ where: { id } });
  }

  private async findOrFail(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('El servicio no existe.');
    return service;
  }
}
