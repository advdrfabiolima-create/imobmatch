import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamInvitePublicController } from './team-invite-public.controller';
import { TeamService } from './team.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [TeamController, TeamInvitePublicController],
  providers: [TeamService],
})
export class TeamModule {}
