import { Module } from '@nestjs/common';
import { CurationAgentService } from './curation-agent.service';
import { TemplateNewsSource } from './template-news.source';

@Module({
  providers: [CurationAgentService, TemplateNewsSource],
  exports: [CurationAgentService],
})
export class SourcesModule {}
