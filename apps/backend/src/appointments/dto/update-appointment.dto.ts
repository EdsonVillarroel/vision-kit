import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
