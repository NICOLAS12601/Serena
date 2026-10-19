import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { AvailabilityModule } from './availability/availability.module.js';
import { ClientsModule } from './clients/clients.module.js';
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
    NotificationsModule,
  ],
})
export class AppModule {}
