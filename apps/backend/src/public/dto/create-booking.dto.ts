import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del solicitante' })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({ example: '+591 68803830', description: 'Teléfono de contacto' })
  @IsString()
  @MaxLength(20)
  @Matches(/^[\d\s+\-()]+$/, { message: 'Teléfono inválido — solo dígitos, espacios y +' })
  phone: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    example: 'Examen visual',
    description: 'Tipo de servicio solicitado',
  })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  serviceType: string;

  @ApiProperty({ example: '2026-04-15', description: 'Fecha preferida (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Fecha inválida — usar formato YYYY-MM-DD' })
  preferredDate: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Hora preferida (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida — usar formato HH:mm' })
  preferredTime?: string;

  @ApiPropertyOptional({ example: 'Tengo dificultad para ver de lejos desde hace 6 meses.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  notes?: string;
}
