import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
      },
    });
  }
}
