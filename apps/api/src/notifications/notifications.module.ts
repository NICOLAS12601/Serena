import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { AdminNotificationsController } from './admin-notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [SettingsModule],
  controllers: [AdminNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
