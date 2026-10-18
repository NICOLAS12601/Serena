import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // GET /settings/public
  @Get('public')
  findPublic() {
    return this.settingsService.findPublic();
  }
}
