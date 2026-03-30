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
  @ApiProperty({ example: 'CURP123456' })
  @IsString() identificationId: string;

  @ApiProperty({ example: 'Ana' })
  @IsString() firstName: string;

  @ApiProperty({ example: 'López' })
  @IsString() lastName: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString() dateOfBirth: string;

  @ApiProperty({ enum: PatientGender, example: PatientGender.female })
  @IsEnum(PatientGender) gender: PatientGender;

  @ApiProperty({ example: '+52 55 1234 5678' })
  @IsString() phone: string;

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

  @ApiProperty({ type: EmergencyContactDto })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;
}
