import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { ClientsService } from './clients.service.js';

// Admin panel: clients and their history. Contains health data (Law 18.331):
// only reachable with Micaela's session.
@Controller('admin/clients')
@UseGuards(AdminGuard)
export class AdminClientsController {
  constructor(private readonly clients: ClientsService) {}

  // GET /admin/clients?q=ana
  @Get()
  findAll(@Query('q') q?: string) {
    return this.clients.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clients.findOne(id);
  }
}
