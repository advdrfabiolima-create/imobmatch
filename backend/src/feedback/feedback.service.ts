import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, userName: string, message: string) {
    return this.prisma.feedback.create({
      data: { userId, userName, message },
    });
  }

  async findAll() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
