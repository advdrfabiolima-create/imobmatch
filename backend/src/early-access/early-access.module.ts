import { Module } from '@nestjs/common';
import { EarlyAccessController } from './early-access.controller';
import { EarlyAccessService } from './early-access.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:     [MailModule],
  controllers: [EarlyAccessController],
  providers:   [EarlyAccessService],
  exports:     [EarlyAccessService],
})
export class EarlyAccessModule {}
