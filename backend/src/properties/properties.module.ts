import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyImportService } from './property-import.service';
import { MatchesModule } from '../matches/matches.module';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [MatchesModule, RankingModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyImportService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
