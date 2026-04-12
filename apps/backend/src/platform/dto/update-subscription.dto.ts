import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: 'plan-id-uuid', description: 'Cambiar a otro plan' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ enum: ['active', 'past_due', 'cancelled', 'trial'] })
  @IsOptional()
  @IsEnum(['active', 'past_due', 'cancelled', 'trial'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'Pago recibido vía QR el 2026-04-01' })
  @IsOptional()
  @IsString()
  paymentNotes?: string;
}
