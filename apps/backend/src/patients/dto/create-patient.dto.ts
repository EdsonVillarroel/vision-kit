import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PatientGender } from '@prisma/client';

class InsuranceDto {
  @IsString() provider: string;
  @IsString() policyNumber: string;
  @IsOptional() @IsString() groupNumber?: string;
}

class EmergencyContactDto {
  @IsString() name: string;
  @IsString() relationship: string;
  @IsString() phone: string;
}

export class CreatePatientDto {
  @IsString() identificationId: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsDateString() dateOfBirth: string;
  @IsEnum(PatientGender) gender: PatientGender;
  @IsString() phone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() address: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() zipCode: string;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) medicalConditions?: string[];
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;
}
