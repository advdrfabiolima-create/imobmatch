import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEarlyAccessLeadDto } from './dto/early-access.dto';

@Injectable()
export class EarlyAccessService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEarlyAccessLeadDto) {
    const existing = await this.prisma.earlyAccessLead.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        'Este e-mail já está na lista de acesso antecipado.',
      );
    }

    return this.prisma.earlyAccessLead.create({
      data: {
        fullName: dto.fullName,
        email:    dto.email,
        whatsapp: dto.whatsapp,
        source:   dto.source ?? 'facebook_group',
      },
      select: { id: true, fullName: true, email: true, createdAt: true },
    });
  }

  async count() {
    return this.prisma.earlyAccessLead.count();
  }
}
