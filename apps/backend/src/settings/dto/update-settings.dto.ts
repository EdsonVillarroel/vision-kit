import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() rfc?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsObject() businessHours?: Record<string, { open: string; close: string; closed: boolean }>;
}
