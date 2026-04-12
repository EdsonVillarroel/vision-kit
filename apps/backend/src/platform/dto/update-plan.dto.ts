import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Profesional Plus' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxUsers?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPatients?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxProducts?: number;

  @ApiPropertyOptional({ example: 4096 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxStorageMb?: number;

  @ApiPropertyOptional({ example: { clinical_exams: true } })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;
}
