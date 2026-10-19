import {
  Equals,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { PaymentMethod, PaymentPlan } from './pricing.js';

/** What the booking form sends. Amounts are not here: the API computes them. */
export class CreateBookingDto {
  @IsInt()
  @Min(1)
  serviceId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha no es válida.' })
  @IsISO8601({ strict: true }, { message: 'La fecha no es válida.' })
  date!: string;

  /** Start time in Montevideo, e.g. "10:30". */
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'El horario no es válido.' })
  time!: string;

  @IsString()
  @MinLength(2, { message: 'Escribí tu nombre.' })
  @MaxLength(100)
  name!: string;

  /** Mobile number; validated and normalized to E.164 by the service. */
  @IsString()
  @MaxLength(30)
  phone!: string;

  /** Optional (ADR-012): an empty field counts as no email. */
  @ValidateIf((_, value) => value !== '' && value != null)
  @IsEmail({}, { message: 'El email no parece válido.' })
  @MaxLength(254)
  email?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de nacimiento no es válida.',
  })
  @IsISO8601(
    { strict: true },
    { message: 'La fecha de nacimiento no es válida.' },
  )
  birthDate!: string;

  /** Health data (Law 18.331): only visible in the admin panel. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @Equals(true, { message: 'Tenés que aceptar las políticas de reserva.' })
  policiesAccepted!: boolean;

  @Equals(true, { message: 'Tenés que aceptar la política de privacidad.' })
  privacyConsent!: boolean;

  @IsIn(['MERCADO_PAGO', 'BANK_TRANSFER'])
  paymentMethod!: PaymentMethod;

  @IsIn(['DEPOSIT', 'FULL'])
  paymentPlan!: PaymentPlan;
}
