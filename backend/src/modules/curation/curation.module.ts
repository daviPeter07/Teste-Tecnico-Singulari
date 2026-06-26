import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NewsModule } from '../news/news.module';
import { QueueModule } from '../queue/queue.module';
import { CurationController } from './curation.controller';
import { CurationService } from './curation.service';
import { CurationRepository } from './curation.repository';
import { TemplateNewsSource } from './sources/template-news.source';

@Module({
  imports: [DatabaseModule, QueueModule, NewsModule],
  controllers: [CurationController],
  providers: [CurationService, CurationRepository, TemplateNewsSource],
  exports: [CurationRepository, CurationService],
})
export class CurationModule {}
