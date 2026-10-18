import { Module } from '@nestjs/common';
import { AdminScheduleController } from './admin-schedule.controller.js';
import { ScheduleService } from './schedule.service.js';

@Module({
  controllers: [AdminScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
