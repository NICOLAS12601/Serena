import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { AvailabilityModule } from './availability/availability.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { InternalKeyGuard } from './common/internal-key.guard.js';
import { HealthController } from './health/health.controller.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ScheduleModule } from './schedule/schedule.module.js';
import { ServicesModule } from './services/services.module.js';
import { SettingsModule } from './settings/settings.module.js';

// Root module: feature modules (bookings, payments, ...) are imported here.
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ServicesModule,
    SettingsModule,
    ScheduleModule,
    ClientsModule,
    AvailabilityModule,
    BookingsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  // Global: runs before every route's own guards (rate limits, admin session).
  providers: [{ provide: APP_GUARD, useClass: InternalKeyGuard }],
})
export class AppModule {}
