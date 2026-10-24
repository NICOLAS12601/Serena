import type { Request } from 'express';
import { clientIp } from './client-ip.js';

function request(headers: Record<string, string>, ip = '10.0.0.1') {
  return { headers, ip } as unknown as Request;
}

describe('clientIp', () => {
  const original = process.env['INTERNAL_API_KEY'];
  beforeEach(() => {
    process.env['INTERNAL_API_KEY'] = 'the-key';
  });
  afterEach(() => {
    if (original === undefined) delete process.env['INTERNAL_API_KEY'];
    else process.env['INTERNAL_API_KEY'] = original;
  });

  it('believes x-client-ip when the request carries the shared key', () => {
    const req = request({
      'x-internal-api-key': 'the-key',
      'x-client-ip': '167.62.69.65',
    });
    expect(clientIp(req)).toBe('167.62.69.65');
  });

  it('ignores x-client-ip without the key or with a wrong one', () => {
    expect(clientIp(request({ 'x-client-ip': '6.6.6.6' }))).toBe('10.0.0.1');
    expect(
      clientIp(
        request({ 'x-internal-api-key': 'nope', 'x-client-ip': '6.6.6.6' }),
      ),
    ).toBe('10.0.0.1');
  });

  it('falls back to req.ip when the web sent no IP', () => {
    expect(clientIp(request({ 'x-internal-api-key': 'the-key' }))).toBe(
      '10.0.0.1',
    );
  });

  it('falls back to req.ip when no key is configured (local)', () => {
    delete process.env['INTERNAL_API_KEY'];
    expect(clientIp(request({ 'x-client-ip': '6.6.6.6' }))).toBe('10.0.0.1');
  });
});
