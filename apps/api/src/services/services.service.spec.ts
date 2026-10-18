import { PrismaService } from '../prisma/prisma.service.js';
import { ServicesService } from './services.service.js';

describe('ServicesService', () => {
  it('returns only active services, in display order, with public fields', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { service: { findMany } } as unknown as PrismaService;

    await new ServicesService(prisma).findActive();

    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ active: true });
    expect(query.orderBy).toEqual([{ sortOrder: 'asc' }, { id: 'asc' }]);
    expect(Object.keys(query.select)).toEqual([
      'id',
      'name',
      'description',
      'durationMin',
      'price',
      'imageUrl',
      'icon',
      'isFirstVisit',
    ]);
  });
});
