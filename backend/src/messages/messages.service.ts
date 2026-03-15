import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REPLY_SELECT = {
  id: true,
  content: true,
  messageType: true,
  sender: { select: { id: true, name: true } },
};

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, dto: {
    receiverId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
  }) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        messageType: dto.messageType ?? 'TEXT',
        replyToId: dto.replyToId ?? null,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        replyTo: { select: REPLY_SELECT },
      },
    });
  }

  async getConversation(userId: string, partnerId: string, query: any) {
    const { page = 1, limit = 80 } = query;
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      skip,
      take: Number(limit),
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        replyTo: { select: REPLY_SELECT },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await this.prisma.message.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return messages;
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationMap.set(partnerId, { partner, lastMessage: msg, unreadCount: 0 });
      }
      if (msg.receiverId === userId && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    }

    return Array.from(conversationMap.values());
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    return { count };
  }

  async getPartnerStatus(partnerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: partnerId },
      select: { lastSeen: true },
    });
    const isOnline = user?.lastSeen
      ? Date.now() - new Date(user.lastSeen).getTime() < 45_000
      : false;
    return { isOnline, lastSeen: user?.lastSeen ?? null };
  }
}
