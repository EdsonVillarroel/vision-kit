import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EyeDto {
  @IsNumber() sphere: number;
  @IsNumber() cylinder: number;
  @IsInt() axis: number;
  @IsNumber() prism: number;
  @IsString() base: string;
  @IsOptional() @IsNumber() addition?: number;
}

class NearEyeDto {
  @IsOptional() @IsNumber() sphere?: number;
  @IsOptional() @IsNumber() cylinder?: number;
  @IsOptional() @IsInt() axis?: number;
  @IsOptional() @IsNumber() prism?: number;
  @IsOptional() @IsString() base?: string;
}

class FarVisionDto {
  @ValidateNested() @Type(() => EyeDto) right: EyeDto;
  @ValidateNested() @Type(() => EyeDto) left: EyeDto;
}

class NearVisionDto {
  @ValidateNested() @Type(() => NearEyeDto) right: NearEyeDto;
  @ValidateNested() @Type(() => NearEyeDto) left: NearEyeDto;
}

class PupillaryDistanceDto {
  @IsNumber() right: number;
  @IsNumber() left: number;
  @IsOptional() @IsNumber() nearRight?: number;
  @IsOptional() @IsNumber() nearLeft?: number;
}

class FrameMeasurementsDto {
  @IsNumber() height: number;
  @IsNumber() right: number;
  @IsNumber() left: number;
}

export class CreateClinicalExamDto {
  @IsString() patientId: string;
  @IsDateString() date: string;
  @IsOptional() @IsString() medicalRecordId?: string;

  @ValidateNested() @Type(() => FarVisionDto) farVision: FarVisionDto;
  @IsOptional() @ValidateNested() @Type(() => NearVisionDto) nearVision?: NearVisionDto;

  @ValidateNested() @Type(() => PupillaryDistanceDto)
  pupillaryDistance: PupillaryDistanceDto;

  @ValidateNested() @Type(() => FrameMeasurementsDto)
  frameMeasurements: FrameMeasurementsDto;

  @IsOptional() @IsString() lensDataRight?: string;
  @IsOptional() @IsString() lensDataLeft?: string;
  @IsOptional() @IsString() observations?: string;
}
