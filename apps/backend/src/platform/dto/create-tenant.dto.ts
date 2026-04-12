import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUUID, MinLength, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Óptica Visión Clara' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'vision-clara', description: 'Slug único — solo letras minúsculas, números y guiones' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones' })
  slug: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#4f46e5' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#818cf8' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ example: 'optica-vision-clara.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ description: 'ID del plan de suscripción' })
  @IsUUID()
  planId: string;

  @ApiProperty({ example: 'admin@visionclara.com' })
  @IsEmail()
  superAdminEmail: string;

  @ApiProperty({ example: 'Carlos Méndez' })
  @IsString()
  superAdminName: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  superAdminPassword: string;
}
