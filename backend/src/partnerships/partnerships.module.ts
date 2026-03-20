import { Module } from '@nestjs/common';
import { PartnershipsController } from './partnerships.controller';
import { PartnershipsService } from './partnerships.service';
import { RankingModule } from '../ranking/ranking.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [RankingModule, MailModule],
  controllers: [PartnershipsController],
  providers: [PartnershipsService],
})
export class PartnershipsModule {}
