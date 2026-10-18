import { BadGatewayException, Injectable, Logger } from '@nestjs/common';

export type Email = { to: string; subject: string; text: string };

/** "sent" went through Resend; "logged" was only printed (no API key set). */
export type DeliveryResult = 'sent' | 'logged';

const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'SERENA <onboarding@resend.dev>';

/**
 * Sends emails with Resend's HTTP API (no SDK: it is a single request).
 * Phase 1 only emails Micaela, never clients (ADR-012).
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(email: Email): Promise<DeliveryResult> {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) {
      // Development without a Resend account: show what would be sent.
      this.logger.log(
        `Email not sent (RESEND_API_KEY is empty)\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`,
      );
      return 'logged';
    }

    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env['MAIL_FROM'] || DEFAULT_FROM,
        to: [email.to],
        subject: email.subject,
        text: email.text,
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const reason = body?.message ?? `error ${response.status}`;
      this.logger.error(`Resend rejected the email: ${reason}`);
      throw new BadGatewayException(`Resend no pudo enviar el mail: ${reason}`);
    }
    return 'sent';
  }
}
