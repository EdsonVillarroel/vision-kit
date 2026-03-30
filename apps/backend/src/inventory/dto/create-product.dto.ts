import {
  IsString, IsEnum, IsNumber, IsInt,
  IsOptional, IsArray, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@prisma/client';

class SpecificationDto {
  @ApiPropertyOptional({ example: 'full-rim' }) @IsOptional() @IsString() frameType?: string;
  @ApiPropertyOptional({ example: 'Acetato' })  @IsOptional() @IsString() material?: string;
  @ApiPropertyOptional({ example: 'Negro' })    @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional({ example: 52.0 })       @IsOptional() @IsNumber() lensSize?: number;
  @ApiPropertyOptional({ example: 18.0 })       @IsOptional() @IsNumber() bridge?: number;
  @ApiPropertyOptional({ example: 140.0 })      @IsOptional() @IsNumber() temple?: number;
  @ApiPropertyOptional({ example: 'progressive' }) @IsOptional() @IsString() lensType?: string;
  @ApiPropertyOptional({ example: 'Policarbonato' }) @IsOptional() @IsString() lensMaterial?: string;
  @ApiPropertyOptional({ example: 1.67 })       @IsOptional() @IsNumber() index?: number;
  @ApiPropertyOptional({ example: ['AR', 'UV'], type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) coatings?: string[];
  @ApiPropertyOptional({ example: 8.6 })        @IsOptional() @IsNumber() baseCurve?: number;
  @ApiPropertyOptional({ example: 14.2 })       @IsOptional() @IsNumber() diameter?: number;
  @ApiPropertyOptional({ example: '-2.00 to +4.00' }) @IsOptional() @IsString() power?: string;
}

class SupplierDto {
  @ApiProperty({ example: 'Óptica Distribuidora SA' })
  @IsString() name: string;

  @ApiPropertyOptional({ example: 'Carlos Mendoza' })
  @IsOptional() @IsString() contact?: string;

  @ApiPropertyOptional({ example: 'ventas@dist.com' })
  @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional({ example: '+52 55 0000 1111' })
  @IsOptional() @IsString() phone?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'MARC-001-NG' })
  @IsString() sku: string;

  @ApiProperty({ example: 'Armazón Ray-Ban Classic' })
  @IsString() name: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.frames })
  @IsEnum(ProductCategory) category: ProductCategory;

  @ApiProperty({ example: 'Ray-Ban' })
  @IsOptional() @IsString() brand?: string;

  @ApiPropertyOptional({ example: 'RB3025' })
  @IsOptional() @IsString() model?: string;

  @ApiProperty({ example: 450.00 })
  @IsNumber() @Min(0) costPrice: number;

  @ApiProperty({ example: 1200.00 })
  @IsNumber() @Min(0) sellingPrice: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional() @IsNumber() @Min(0) discount?: number;

  @ApiProperty({ example: 15 })
  @IsInt() @Min(0) stock: number;

  @ApiProperty({ example: 5 })
  @IsInt() @Min(0) minStock: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional() @IsInt() maxStock?: number;

  @ApiPropertyOptional({ example: ['https://img.url/prod1.jpg'], type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @ApiPropertyOptional({ type: SpecificationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto;

  @ApiPropertyOptional({ type: SupplierDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierDto)
  supplier?: SupplierDto;
}
