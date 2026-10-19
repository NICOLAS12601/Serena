import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Every field optional: the panel sends only what changes. null clears a text. */
export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  depositPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  transferDiscountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  mpHoldMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(48)
  transferHoldHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  slotIntervalMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(168)
  minAdvanceHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bankDetails?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string | null;

  /** Validated and normalized to E.164 by SettingsService (common/phone.ts). */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappNumber?: string | null;

  /** Validated and lowercased by SettingsService. */
  @IsOptional()
  @IsString()
  @MaxLength(254)
  notificationEmail?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  cancellationPolicyText?: string | null;
}
