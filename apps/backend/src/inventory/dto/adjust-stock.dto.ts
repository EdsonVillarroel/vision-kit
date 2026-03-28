import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @IsEnum(StockMovementType) type: StockMovementType;
  @IsInt() @Min(1) quantity: number;
  @IsString() reason: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() notes?: string;
}
