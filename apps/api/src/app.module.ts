import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ServicesModule } from './services/services.module.js';

// Root module: feature modules (bookings, payments, ...) are imported here.
@Module({
  imports: [PrismaModule, ServicesModule],
})
export class AppModule {}
