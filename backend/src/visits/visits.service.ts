import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const BASE_VISITS = 1_847; // offset de prova social — visitas reais somam por cima

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async trackAndCount(ip: string, page = 'lista-vip'): Promise<number> {
    await this.prisma.pageVisit.upsert({
      where: { ip_page: { ip, page } },
      create: { ip, page },
      update: {}, // não atualiza nada — só registra se for novo
    });

    const real = await this.prisma.pageVisit.count({ where: { page } });
    return BASE_VISITS + real;
  }

  async count(page = 'lista-vip'): Promise<number> {
    const real = await this.prisma.pageVisit.count({ where: { page } });
    return BASE_VISITS + real;
  }
}
