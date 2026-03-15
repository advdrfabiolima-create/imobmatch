import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Mensagens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensagem' })
  send(
    @Request() req,
    @Body() dto: { receiverId: string; content: string; messageType?: string; replyToId?: string },
  ) {
    return this.messagesService.send(req.user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar todas as conversas' })
  getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Quantidade de mensagens não lidas' })
  getUnread(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Get(':partnerId/status')
  @ApiOperation({ summary: 'Status online do parceiro' })
  getPartnerStatus(@Param('partnerId') partnerId: string) {
    return this.messagesService.getPartnerStatus(partnerId);
  }

  @Get(':partnerId')
  @ApiOperation({ summary: 'Conversa com um corretor específico' })
  getConversation(
    @Param('partnerId') partnerId: string,
    @Request() req,
    @Query() query: any,
  ) {
    return this.messagesService.getConversation(req.user.id, partnerId, query);
  }
}
