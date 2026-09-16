import {
  IsString, IsEmail, IsEnum, IsOptional,
  IsArray, IsDateString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientGender } from '@prisma/client';

class InsuranceDto {
  @ApiProperty({ example: 'IMSS' })
  @IsString() provider: string;

  @ApiProperty({ example: 'POL-123456' })
  @IsString() policyNumber: string;

  @ApiPropertyOptional({ example: 'GRP-001' })
  @IsOptional() @IsString() groupNumber?: string;
}

class EmergencyContactDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString() name: string;

  @ApiProperty({ example: 'Padre' })
  @IsString() relationship: string;

  @ApiProperty({ example: '+52 55 9876 5432' })
  @IsString() phone: string;
}

export class CreatePatientDto {
  // Unico dato obligatorio del cliente: nombre completo (nombre + apellido).
  // El resto es opcional para agilizar el registro en mostrador.
  @ApiPropertyOptional({ example: 'CURP123456', description: 'Se autogenera si no se envia' })
  @IsOptional() @IsString() identificationId?: string;

  @ApiProperty({ example: 'Ana' })
  @IsString() firstName: string;

  @ApiProperty({ example: 'López' })
  @IsString() lastName: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional() @IsDateString() dateOfBirth?: string;

  @ApiPropertyOptional({ enum: PatientGender, example: PatientGender.female })
  @IsOptional() @IsEnum(PatientGender) gender?: PatientGender;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ example: 'ana@email.com' })
  @IsOptional() @IsEmail() email?: string;

  @ApiPropertyOptional({ example: 'Av. Insurgentes 123' })
  @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional({ example: 'CDMX' })
  @IsOptional() @IsString() state?: string;

  @ApiPropertyOptional({ example: '06600' })
  @IsOptional() @IsString() zipCode?: string;

  @ApiPropertyOptional({ example: ['Penicilina'], type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];

  @ApiPropertyOptional({ example: ['Diabetes'], type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) medicalConditions?: string[];

  @ApiPropertyOptional({ example: 'Paciente frecuente desde 2020' })
  @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ type: InsuranceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;

  @ApiPropertyOptional({ type: EmergencyContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}
