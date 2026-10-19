import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import {
  CompleteBookingDto,
  RescheduleBookingDto,
  RescheduleSlotsQuery,
} from './admin-bookings.dto.js';
import { AdminBookingsService } from './admin-bookings.service.js';

// Admin panel: the agenda. Includes the reason for the visit (health data,
// Law 18.331), so it is only reachable with Micaela's session.
@Controller('admin/bookings')
@UseGuards(AdminGuard)
export class AdminBookingsController {
  constructor(private readonly bookings: AdminBookingsService) {}

  @Get()
  overview() {
    return this.bookings.overview();
  }

  @Post(':id/receipt-received')
  @HttpCode(200)
  receiptReceived(@Param('id', ParseIntPipe) id: number) {
    return this.bookings.markReceiptReceived(id);
  }

  @Post(':id/confirm-payment')
  @HttpCode(200)
  confirmPayment(@Param('id', ParseIntPipe) id: number) {
    return this.bookings.confirmPayment(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookings.cancel(id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompleteBookingDto,
  ) {
    return this.bookings.complete(id, body.extraAmount);
  }

  @Post(':id/no-show')
  @HttpCode(200)
  noShow(@Param('id', ParseIntPipe) id: number) {
    return this.bookings.markNoShow(id);
  }

  // GET /admin/bookings/12/slots?date=2026-10-24
  @Get(':id/slots')
  async slots(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: RescheduleSlotsQuery,
  ) {
    return {
      date: query.date,
      slots: await this.bookings.rescheduleSlots(id, query.date),
    };
  }

  @Post(':id/reschedule')
  @HttpCode(200)
  reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RescheduleBookingDto,
  ) {
    return this.bookings.reschedule(id, body.date, body.time);
  }
}
