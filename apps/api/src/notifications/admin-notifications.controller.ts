import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { SettingsService } from '../settings/settings.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('admin/notifications')
@UseGuards(AdminGuard)
export class AdminNotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly settings: SettingsService,
  ) {}

  /** Lets Micaela check from the panel that new-booking emails reach her. */
  @Post('test')
  @HttpCode(200)
  async sendTest() {
    const { notificationEmail } = await this.settings.findAll();
    if (!notificationEmail) {
      throw new BadRequestException(
        'Primero cargá el email para avisos y guardá los cambios.',
      );
    }
    const result = await this.notifications.sendEmail({
      to: notificationEmail,
      subject: 'Prueba de avisos de SERENA',
      text: 'Si te llegó este mail, los avisos de reservas nuevas funcionan. Cada vez que alguien reserve te va a llegar uno así, con los datos del turno.',
    });
    return { result, to: notificationEmail };
  }
}
