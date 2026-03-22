import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty, IsEmail, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum PropertyTypeEnum {
  HOUSE = 'HOUSE',
  CONDO_HOUSE = 'CONDO_HOUSE',
  APARTMENT = 'APARTMENT',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  RURAL = 'RURAL',
}

export class CreateBuyerDto {
  @ApiProperty({ example: 'Carlos Oliveira' })
  @IsString() @IsNotEmpty() buyerName: string;

  @ApiPropertyOptional()
@IsOptional()
@IsEmail()
@Transform(({ value }) => value === '' ? undefined : value)
email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString() @IsNotEmpty() desiredCity: string;

  @ApiPropertyOptional() @IsOptional() @IsString() desiredState?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() desiredNeighborhood?: string;

  @ApiProperty({ example: 900000 })
  @IsNumber() @Min(0) @Type(() => Number) maxPrice: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) minPrice?: number;

  @ApiProperty({ enum: PropertyTypeEnum })
  @IsEnum(PropertyTypeEnum) propertyType: PropertyTypeEnum;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional() @IsNumber() @Type(() => Number) bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;
}

export class UpdateBuyerDto {
  @IsOptional() @IsString() buyerName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() desiredCity?: string;
  @IsOptional() @IsString() desiredState?: string;
  @IsOptional() @IsString() desiredNeighborhood?: string;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsEnum(PropertyTypeEnum) propertyType?: PropertyTypeEnum;
  @IsOptional() @IsNumber() @Type(() => Number) bedrooms?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
}
