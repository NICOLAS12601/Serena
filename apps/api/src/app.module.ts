import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ServicesModule } from './services/services.module.js';
import { SettingsModule } from './settings/settings.module.js';

// Root module: feature modules (bookings, payments, ...) are imported here.
@Module({
  imports: [PrismaModule, AuthModule, ServicesModule, SettingsModule],
})
export class AppModule {}
