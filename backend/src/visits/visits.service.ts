import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async trackAndCount(ip: string, page = 'lista-vip'): Promise<number> {
    await this.prisma.pageVisit.upsert({
      where: { ip_page: { ip, page } },
      create: { ip, page },
      update: {}, // não atualiza nada — só registra se for novo
    });

    return this.prisma.pageVisit.count({ where: { page } });
  }

  async count(page = 'lista-vip'): Promise<number> {
    return this.prisma.pageVisit.count({ where: { page } });
  }
}
