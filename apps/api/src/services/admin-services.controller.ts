import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreateServiceDto, UpdateServiceDto } from './service.dto.js';
import { ServicesService } from './services.service.js';

// Admin panel: manage services. Every route requires Micaela's session.
@Controller('admin/services')
@UseGuards(AdminGuard)
export class AdminServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findAllForAdmin();
  }

  @Post()
  create(@Body() body: CreateServiceDto) {
    return this.services.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateServiceDto,
  ) {
    return this.services.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.services.remove(id);
  }
}
