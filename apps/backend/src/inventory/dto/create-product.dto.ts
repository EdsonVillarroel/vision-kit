import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

class SpecificationDto {
  @IsOptional() @IsString() frameType?: string;
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsNumber() lensSize?: number;
  @IsOptional() @IsNumber() bridge?: number;
  @IsOptional() @IsNumber() temple?: number;
  @IsOptional() @IsString() lensType?: string;
  @IsOptional() @IsString() lensMaterial?: string;
  @IsOptional() @IsNumber() index?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) coatings?: string[];
  @IsOptional() @IsNumber() baseCurve?: number;
  @IsOptional() @IsNumber() diameter?: number;
  @IsOptional() @IsString() power?: string;
}

class SupplierDto {
  @IsString() name: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
}

export class CreateProductDto {
  @IsString() sku: string;
  @IsString() name: string;
  @IsEnum(ProductCategory) category: ProductCategory;
  @IsString() brand: string;
  @IsOptional() @IsString() model?: string;
  @IsNumber() @Min(0) costPrice: number;
  @IsNumber() @Min(0) sellingPrice: number;
  @IsOptional() @IsNumber() @Min(0) discount?: number;
  @IsInt() @Min(0) stock: number;
  @IsInt() @Min(0) minStock: number;
  @IsOptional() @IsInt() maxStock?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierDto)
  supplier?: SupplierDto;
}
