import { Controller, Get, Query } from '@nestjs/common';
import { AvailableDaysQuery, DaySlotsQuery } from './availability.dto.js';
import { AvailabilityService } from './availability.service.js';

// Public: what the booking calendar shows. Says nothing about who booked.
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  // GET /availability?serviceId=1&date=2026-10-22
  @Get()
  async daySlots(@Query() query: DaySlotsQuery) {
    return {
      date: query.date,
      slots: await this.availability.daySlots(query.serviceId, query.date),
    };
  }

  // GET /availability/days?serviceId=1&month=2026-10
  @Get('days')
  async availableDays(@Query() query: AvailableDaysQuery) {
    return {
      month: query.month,
      days: await this.availability.availableDays(query.serviceId, query.month),
    };
  }
}
