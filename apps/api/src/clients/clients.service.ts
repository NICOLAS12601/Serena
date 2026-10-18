import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Clients matching the search (name, email or phone), newest first. */
  findAll(search?: string) {
    const q = search?.trim();
    return this.prisma.client.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q.toLowerCase() } },
              { phone: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          orderBy: { startsAt: 'desc' },
          take: 1,
          select: { startsAt: true },
        },
      },
    });
  }

  /** One client with their whole booking history (includes health data). */
  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { startsAt: 'desc' },
          select: {
            id: true,
            startsAt: true,
            status: true,
            paymentMethod: true,
            paymentPlan: true,
            priceSnapshot: true,
            depositAmount: true,
            reason: true,
            service: { select: { name: true } },
          },
        },
      },
    });
    if (!client) throw new NotFoundException('El cliente no existe.');
    return client;
  }
}
