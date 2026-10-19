import { BadRequestException } from '@nestjs/common';
import type { AvailabilityService } from '../availability/availability.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AdminBookingsService } from './admin-bookings.service.js';

const NOW = new Date('2026-10-22T15:00:00Z');

function setup(booking: Record<string, unknown>) {
  const tx = {
    booking: { update: vi.fn(), updateMany: vi.fn() },
    payment: { create: vi.fn() },
  };
  const prisma = {
    booking: {
      findUnique: vi.fn().mockResolvedValue({ id: 7, ...booking }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 7, payments: [] }),
      update: vi.fn(),
    },
    $transaction: vi.fn((work: (t: typeof tx) => unknown) => work(tx)),
  };
  const service = new AdminBookingsService(
    prisma as unknown as PrismaService,
    {} as AvailabilityService,
  );
  return { service, prisma, tx };
}

describe('AdminBookingsService', () => {
  it('records the deposit when confirming a transfer paid by deposit', async () => {
    const { service, tx } = setup({
      status: 'PENDING_VERIFICATION',
      paymentPlan: 'DEPOSIT',
      priceSnapshot: 1000,
      depositAmount: 500,
    });
    await service.confirmPayment(7, NOW);
    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'CONFIRMED', holdExpiresAt: null },
    });
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: { bookingId: 7, amount: 500, status: 'APPROVED', verifiedAt: NOW },
    });
  });

  it('records the whole price when the client paid in full', async () => {
    const { service, tx } = setup({
      status: 'PENDING_VERIFICATION',
      paymentPlan: 'FULL',
      priceSnapshot: 1000,
      depositAmount: 500,
    });
    await service.confirmPayment(7, NOW);
    expect(tx.payment.create.mock.calls[0][0].data.amount).toBe(1000);
  });

  it('refuses to cancel a completed booking', async () => {
    const { service } = setup({ status: 'COMPLETED' });
    await expect(service.cancel(7)).rejects.toThrow(
      'No se puede: la reserva está completada.',
    );
  });

  it('refuses to close a session that has not started', async () => {
    const { service } = setup({
      status: 'CONFIRMED',
      startsAt: new Date('2026-10-22T18:00:00Z'),
    });
    await expect(service.markNoShow(7, NOW)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('records what was collected on the day when completing', async () => {
    const { service, tx } = setup({
      status: 'CONFIRMED',
      startsAt: new Date('2026-10-22T13:00:00Z'),
    });
    await service.complete(7, 500, NOW);
    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'COMPLETED' },
    });
    expect(tx.payment.create.mock.calls[0][0].data.amount).toBe(500);
  });

  it('records no payment when nothing was collected on the day', async () => {
    const { service, tx } = setup({
      status: 'CONFIRMED',
      startsAt: new Date('2026-10-22T13:00:00Z'),
    });
    await service.complete(7, 0, NOW);
    expect(tx.payment.create).not.toHaveBeenCalled();
  });
});
