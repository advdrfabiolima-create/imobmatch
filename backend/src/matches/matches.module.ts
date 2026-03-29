import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { RankingModule } from '../ranking/ranking.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [RankingModule, MailModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
