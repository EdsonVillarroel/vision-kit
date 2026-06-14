import { IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCommissionsDto {
  @ApiPropertyOptional({ example: '2026-03-01', description: 'Fecha inicio (YYYY-MM-DD). Default: hoy - 30d' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-31', description: 'Fecha fin (YYYY-MM-DD). Default: hoy' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 'uuid-del-vendedor', description: 'Filtrar por un vendedor específico' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
