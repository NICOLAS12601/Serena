import { BadGatewayException } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

const email = { to: 'mica@example.com', subject: 'Hola', text: 'Prueba' };

describe('NotificationsService.sendEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('only logs the email when there is no API key', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await new NotificationsService().sendEmail(email)).toBe('logged');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends it through Resend with the API key', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    expect(await new NotificationsService().sendEmail(email)).toBe('sent');
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    expect(JSON.parse(init.body)).toMatchObject({
      to: ['mica@example.com'],
      subject: 'Hola',
    });
  });

  it('reports the reason when Resend rejects the email', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const message =
      'You can only send testing emails to your own email address';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message }), { status: 403 }),
        ),
    );
    const sending = new NotificationsService().sendEmail(email);
    await expect(sending).rejects.toThrow(BadGatewayException);
    await expect(sending).rejects.toThrow(message);
  });
});
