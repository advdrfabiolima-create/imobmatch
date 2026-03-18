import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportPropertyDto {
  @ApiProperty({ example: 'https://www.vivareal.com.br/imovel/apartamento-123' })
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Informe uma URL válida começando com http:// ou https://' })
  url: string;
}

export interface ImportedPropertyData {
  title?: string;
  type?: string;
  price?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  areaM2?: number;
  description?: string;
  photos?: string[];
  _warning?: string;
}
