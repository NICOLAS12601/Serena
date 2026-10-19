import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

@Module({
  imports: [AvailabilityModule, NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
