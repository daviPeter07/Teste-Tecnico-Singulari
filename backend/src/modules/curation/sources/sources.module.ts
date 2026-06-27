import { Module } from '@nestjs/common';
import { CurationAgentService } from './curation-agent.service';
import { LocalJsonNewsSource } from './local-json-news.source';
import { TemplateNewsSource } from './template-news.source';

@Module({
  providers: [CurationAgentService, TemplateNewsSource, LocalJsonNewsSource],
  exports: [CurationAgentService],
})
export class SourcesModule {}
