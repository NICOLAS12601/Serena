import {
  IsInt,
  IsISO8601,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CompleteBookingDto {
  /** Collected on the day (pesos), on top of what was paid online. */
  @IsOptional()
  @IsInt({ message: 'El monto tiene que ser un número entero de pesos.' })
  @Min(0)
  @Max(1_000_000)
  extraAmount?: number;
}

export class RescheduleSlotsQuery {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha no es válida.' })
  @IsISO8601({ strict: true }, { message: 'La fecha no es válida.' })
  date!: string;
}

export class RescheduleBookingDto extends RescheduleSlotsQuery {
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'El horario no es válido.' })
  time!: string;
}
