import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { CurationController } from './curation.controller';
import { CurationService } from './curation.service';
import { CurationRepository } from './curation.repository';
import { TemplateNewsSource } from './sources/template-news.source';
import { NewsCurationProcessor } from './processors/news-curation.processor';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [CurationController],
  providers: [
    CurationService,
    CurationRepository,
    TemplateNewsSource,
    NewsCurationProcessor,
  ],
})
export class CurationModule {}
