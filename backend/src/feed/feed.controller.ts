import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar post no feed' })
  create(@Request() req, @Body() dto: any) {
    return this.feedService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar posts do feed' })
  findAll(@Query() query: any) {
    return this.feedService.findAll(query);
  }
}
