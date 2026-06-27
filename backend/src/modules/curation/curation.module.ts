import { Module } from '@nestjs/common';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { RunModule } from './run/run.module';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [RunModule, SourcesModule, EnrichmentModule],
})
export class CurationModule {}
