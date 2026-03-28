import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType } from '@prisma/client';

class VisualAcuityDto {
  @IsString() uncorrected: string;
  @IsString() corrected: string;
}

class EyeMeasurementDto {
  @IsNumber() sphere: number;
  @IsNumber() cylinder: number;
  @IsInt() axis: number;
  @IsOptional() @IsNumber() add?: number;
  @IsOptional() @IsNumber() prism?: number;
  @IsOptional() @IsString() base?: string;
  @IsOptional() @IsNumber() pd?: number;
}

class VisualAcuityPairDto {
  @ValidateNested() @Type(() => VisualAcuityDto) right: VisualAcuityDto;
  @ValidateNested() @Type(() => VisualAcuityDto) left: VisualAcuityDto;
}

class MeasurementPairDto {
  @ValidateNested() @Type(() => EyeMeasurementDto) right: EyeMeasurementDto;
  @ValidateNested() @Type(() => EyeMeasurementDto) left: EyeMeasurementDto;
}

class IopDto {
  @IsInt() right: number;
  @IsInt() left: number;
}

export class CreateMedicalRecordDto {
  @IsString() patientId: string;
  @IsDateString() date: string;
  @IsEnum(ExamType) examType: ExamType;

  @ValidateNested()
  @Type(() => VisualAcuityPairDto)
  visualAcuity: VisualAcuityPairDto;

  @ValidateNested()
  @Type(() => MeasurementPairDto)
  refraction: MeasurementPairDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MeasurementPairDto)
  prescription?: MeasurementPairDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IopDto)
  intraocularPressure?: IopDto;

  @IsOptional() @IsArray() @IsString({ each: true }) diagnosis?: string[];
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() nextVisitRecommended?: string;
}
