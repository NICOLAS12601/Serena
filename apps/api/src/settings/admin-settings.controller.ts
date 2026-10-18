import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { UpdateSettingsDto } from './settings.dto.js';
import { SettingsService } from './settings.service.js';

// Admin panel: the full configuration, including private data (address,
// bank details) that the public endpoint never returns.
@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  find() {
    return this.settings.findAll();
  }

  @Patch()
  update(@Body() body: UpdateSettingsDto) {
    return this.settings.update(body);
  }
}
