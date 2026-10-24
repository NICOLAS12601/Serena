import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('health')
export class HealthController {
  // GET /health — used by the hosting provider to know the API is up. It also
  // returns the IP the API sees for the caller, to check that TRUST_PROXY is
  // right behind the web's /api proxy (it is the caller's own IP: nothing
  // private). No database access, so it answers even if the database is down.
  @Get()
  check(@Req() req: Request) {
    return { status: 'ok', ip: req.ip };
  }
}
