import { Module } from '@nestjs/common';
import { NewsModule } from '../../news/news.module';
import { PreferencesModule } from '../../preferences/preferences.module';
import { QueueModule } from '../../queue/queue.module';
import { EnrichmentModule } from '../enrichment/enrichment.module';
import { CurationRunProcessor } from '../processors/curation-run.processor';
import { NewsProcessingProcessor } from '../processors/news-processing.processor';
import { RunModule } from '../run/run.module';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    RunModule,
    SourcesModule,
    EnrichmentModule,
    NewsModule,
    PreferencesModule,
    QueueModule,
  ],
  providers: [CurationRunProcessor, NewsProcessingProcessor],
})
export class ProcessingModule {}
