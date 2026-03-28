import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class SaleItemDto {
  @IsString() productId: string;
  @IsInt() @Min(1) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsOptional() @IsNumber() @Min(0) discount?: number;
}

class PaymentDto {
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @IsNumber() @Min(0) amount: number;
  @IsOptional() @IsString() reference?: string;
}

export class CreateSaleDto {
  @IsString() patientId: string;
  @IsOptional() @IsString() medicalRecordId?: string;
  @IsDateString() date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional() @IsNumber() @Min(0) discount?: number;
  @IsNumber() @Min(0) tax: number;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments?: PaymentDto[];

  @IsOptional() @IsBoolean() prescriptionRequired?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() warrantyExpiryDate?: string;
  @IsOptional() @IsString() warrantyTerms?: string;
}
