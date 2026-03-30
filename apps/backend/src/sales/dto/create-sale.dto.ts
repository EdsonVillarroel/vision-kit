import {
  IsString, IsEnum, IsNumber, IsInt,
  IsOptional, IsBoolean, IsArray,
  IsDateString, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

class SaleItemDto {
  @ApiProperty({ example: 'uuid-del-producto' })
  @IsString() productId: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1) quantity: number;

  @ApiProperty({ example: 1200.00 })
  @IsNumber() @Min(0) unitPrice: number;

  @ApiPropertyOptional({ example: 10, description: 'Descuento en porcentaje' })
  @IsOptional() @IsNumber() @Min(0) discount?: number;
}

class PaymentDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.card })
  @IsEnum(PaymentMethod) method: PaymentMethod;

  @ApiProperty({ example: 1392.00 })
  @IsNumber() @Min(0) amount: number;

  @ApiPropertyOptional({ example: '****1234' })
  @IsOptional() @IsString() reference?: string;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid-del-paciente' })
  @IsString() patientId: string;

  @ApiPropertyOptional({ example: 'uuid-del-historial' })
  @IsOptional() @IsString() medicalRecordId?: string;

  @ApiProperty({ example: '2026-03-28' })
  @IsDateString() date: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({ example: 0, description: 'Descuento global en porcentaje' })
  @IsOptional() @IsNumber() @Min(0) discount?: number;

  @ApiProperty({ example: 0.16, description: 'Factor de IVA (ej: 0.16 = 16%)' })
  @IsNumber() @Min(0) tax: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.card })
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ type: [PaymentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments?: PaymentDto[];

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean() prescriptionRequired?: boolean;

  @ApiPropertyOptional({ example: 'Requiere lente progresivo' })
  @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ example: '2027-03-28' })
  @IsOptional() @IsDateString() warrantyExpiryDate?: string;

  @ApiPropertyOptional({ example: '1 año contra defectos de fabricación' })
  @IsOptional() @IsString() warrantyTerms?: string;
}
