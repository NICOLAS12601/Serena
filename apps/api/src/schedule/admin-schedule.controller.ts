import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreateTimeOffDto, ReplaceScheduleDto } from './schedule.dto.js';
import { ScheduleService } from './schedule.service.js';

// Admin panel: weekly opening hours and time off (holidays, vacations).
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get('schedule')
  getWeekly() {
    return this.schedule.getWeekly();
  }

  @Put('schedule')
  replaceWeekly(@Body() body: ReplaceScheduleDto) {
    return this.schedule.replaceWeekly(body.ranges);
  }

  @Get('time-off')
  getTimeOff() {
    return this.schedule.getUpcomingTimeOff();
  }

  @Post('time-off')
  createTimeOff(@Body() body: CreateTimeOffDto) {
    return this.schedule.createTimeOff(body);
  }

  @Delete('time-off/:id')
  @HttpCode(204)
  removeTimeOff(@Param('id', ParseIntPipe) id: number) {
    return this.schedule.removeTimeOff(id);
  }
}
