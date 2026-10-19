import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const EVERY_MINUTE = 60_000;

/**
 * Marks as EXPIRED the pending bookings whose hold ran out, once a minute.
 * Free slots do not depend on it (they already ignore expired holds); it keeps
 * statuses accurate for the panel. A plain timer instead of a scheduler
 * library: it is the only periodic task.
 */
@Injectable()
export class BookingsExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingsExpiryService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      this.expire().catch((error: unknown) =>
        this.logger.error(`Could not expire holds: ${String(error)}`),
      );
    }, EVERY_MINUTE);
    // Do not keep the process alive just for this timer.
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  async expire(now = new Date()) {
    const { count } = await this.prisma.booking.updateMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'PENDING_VERIFICATION'] },
        holdExpiresAt: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });
    if (count > 0) this.logger.log(`${count} pending booking(s) expired`);
    return count;
  }
}
