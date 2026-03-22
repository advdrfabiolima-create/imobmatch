import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PropertyTypeEnum {
  HOUSE = 'HOUSE',
  CONDO_HOUSE = 'CONDO_HOUSE',
  APARTMENT = 'APARTMENT',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  RURAL = 'RURAL',
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Apartamento 3 quartos - Vila Madalena' })
  @IsString() @IsNotEmpty() title: string;

  @ApiProperty({ enum: PropertyTypeEnum })
  @IsEnum(PropertyTypeEnum) type: PropertyTypeEnum;

  @ApiProperty({ example: 850000 })
  @IsNumber() @Min(0) @Type(() => Number) price: number;

  @ApiProperty({ example: 'São Paulo' })
  @IsString() @IsNotEmpty() city: string;

  @ApiProperty({ example: 'SP' })
  @IsString() @IsNotEmpty() state: string;

  @ApiPropertyOptional({ example: 'Vila Madalena' })
  @IsOptional() @IsString() neighborhood?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional() @IsNumber() @Type(() => Number) bedrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber() @Type(() => Number) suites?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @IsNumber() @Type(() => Number) bathrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @IsNumber() @Type(() => Number) parkingSpots?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional() @IsNumber() @Type(() => Number) areaM2?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() photos?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean() isPublic?: boolean;

  @ApiPropertyOptional({ example: 'SALE', enum: ['SALE', 'RENT'] })
  @IsOptional() @IsString() listingType?: string;
}

export class UpdatePropertyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsEnum(PropertyTypeEnum) type?: PropertyTypeEnum;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) price?: number;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() @Type(() => Number) bedrooms?: number;
  @IsOptional() @IsNumber() @Type(() => Number) suites?: number;
  @IsOptional() @IsNumber() @Type(() => Number) bathrooms?: number;
  @IsOptional() @IsNumber() @Type(() => Number) parkingSpots?: number;
  @IsOptional() @IsNumber() @Type(() => Number) areaM2?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() photos?: string[];
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() listingType?: string;
}
