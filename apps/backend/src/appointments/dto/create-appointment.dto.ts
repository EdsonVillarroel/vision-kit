import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString() patientId: string;
  @IsString() practitionerId: string;
  @IsDateString() date: string;
  @IsString() time: string;
  @IsOptional() @IsInt() @Min(15) duration?: number;
  @IsEnum(AppointmentType) type: AppointmentType;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() medicalRecordId?: string;
}
