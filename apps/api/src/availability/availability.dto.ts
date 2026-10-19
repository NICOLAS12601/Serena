import { Type } from 'class-transformer';
import { IsInt, IsISO8601, Matches, Min } from 'class-validator';

export class DaySlotsQuery {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId!: number;

  /** "YYYY-MM-DD"; strict mode also rejects impossible dates like 2026-02-31. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date tiene que ser AAAA-MM-DD.' })
  @IsISO8601({ strict: true }, { message: 'Esa fecha no existe.' })
  date!: string;
}

export class AvailableDaysQuery {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId!: number;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month tiene que ser AAAA-MM.',
  })
  month!: string;
}
