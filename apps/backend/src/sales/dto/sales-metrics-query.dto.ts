import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SalesMetricsQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01', description: 'Fecha inicial YYYY-MM-DD. Default: hoy - 30 días' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-01-31', description: 'Fecha final YYYY-MM-DD. Default: hoy' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
