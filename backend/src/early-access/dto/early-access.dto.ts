import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
  MinLength, IsArray, ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEarlyAccessLeadDto {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty({ message: 'Nome obrigatório' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter ao menos 2 caracteres' })
  fullName: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'facebook_group' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class BulkInviteDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
