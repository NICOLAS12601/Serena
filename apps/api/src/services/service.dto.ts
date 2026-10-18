import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Icons the web app knows how to draw (apps/web/src/components/service-icon.tsx). */
export const SERVICE_ICONS = ['lotus', 'leaf', 'waves', 'wood-roller'] as const;

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string | null;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMin!: number;

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  price!: number;

  @IsOptional()
  @IsIn(SERVICE_ICONS)
  icon?: string | null;

  @IsOptional()
  @IsBoolean()
  isFirstVisit?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

/** Every field optional: send only what changes. */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
