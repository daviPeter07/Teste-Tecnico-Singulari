import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AiModule } from '../ai/ai.module';
import { NewsModule } from '../news/news.module';
import { QueueModule } from '../queue/queue.module';
import { CurationAgentService } from './curation-agent.service';
import { CurationController } from './curation.controller';
import { CurationRepository } from './curation.repository';
import { CurationService } from './curation.service';
import { NewsEnrichmentService } from './news-enrichment.service';
import { TemplateNewsSource } from './sources/template-news.source';

@Module({
  imports: [DatabaseModule, QueueModule, NewsModule, AiModule],
  controllers: [CurationController],
  providers: [
    CurationAgentService,
    CurationService,
    CurationRepository,
    NewsEnrichmentService,
    TemplateNewsSource,
  ],
  exports: [
    CurationAgentService,
    CurationRepository,
    CurationService,
    NewsEnrichmentService,
  ],
})
export class CurationModule {}
