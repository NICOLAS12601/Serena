import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { AdminBookingsService } from './admin-bookings.service.js';
import { BookingsExpiryService } from './bookings-expiry.service.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

@Module({
  imports: [AvailabilityModule, NotificationsModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, AdminBookingsService, BookingsExpiryService],
})
export class BookingsModule {}
