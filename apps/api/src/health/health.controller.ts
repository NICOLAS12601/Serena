import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { clientIp } from '../common/client-ip.js';
import { SkipInternalKey } from '../common/internal-key.guard.js';

// Render's health check calls the API directly, without the web's key.
@SkipInternalKey()
@Controller('health')
export class HealthController {
  // GET /health — used by the hosting provider to know the API is up. It also
  // returns the IP the API sees for the caller (the caller's own IP: nothing
  // private), to check it through the web's /api proxy. No database access,
  // so it answers even if the database is down.
  // "ip" is the one the rate limits use (clientIp); "proxyIp" what Express
  // gets by counting proxies (TRUST_PROXY), the fallback.
  @Get()
  check(@Req() req: Request) {
    return { status: 'ok', ip: clientIp(req), proxyIp: req.ip };
  }
}
