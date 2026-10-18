import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class WeeklyRangeDto {
  /** 0 = Sunday … 6 = Saturday */
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  /** Minutes since midnight, e.g. 540 = 09:00 */
  @IsInt()
  @Min(0)
  @Max(1440)
  startMinutes!: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  endMinutes!: number;
}

/** The whole weekly schedule, replaced at once. */
export class ReplaceScheduleDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => WeeklyRangeDto)
  ranges!: WeeklyRangeDto[];
}

export class CreateTimeOffDto {
  /** ISO date-time, e.g. "2026-12-24T00:00:00-03:00" */
  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
