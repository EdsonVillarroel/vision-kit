import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty({ example: 'Profesional' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'profesional' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 350 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'BOB', default: 'BOB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ['monthly', 'yearly'], default: 'monthly' })
  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  billingPeriod?: string;

  @ApiProperty({ example: 5, description: 'Máximo de usuarios (-1 = ilimitado)' })
  @IsNumber()
  @Type(() => Number)
  maxUsers: number;

  @ApiProperty({ example: 1000, description: 'Máximo de pacientes (-1 = ilimitado)' })
  @IsNumber()
  @Type(() => Number)
  maxPatients: number;

  @ApiProperty({ example: 500, description: 'Máximo de productos (-1 = ilimitado)' })
  @IsNumber()
  @Type(() => Number)
  maxProducts: number;

  @ApiProperty({ example: 2048, description: 'Almacenamiento en MB' })
  @IsNumber()
  @Type(() => Number)
  maxStorageMb: number;

  @ApiPropertyOptional({ example: { clinical_exams: true, landing: true } })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 2, description: 'Orden de display' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;
}
