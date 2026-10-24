import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ClientIpThrottlerGuard } from '../common/client-ip.js';
import { CreateBookingDto } from './bookings.dto.js';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // POST /bookings — public. Limited so a script cannot fill the agenda with
  // pending bookings (the hold also expires on its own).
  @Post()
  @UseGuards(ClientIpThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() body: CreateBookingDto) {
    return this.bookings.create(body);
  }
}
