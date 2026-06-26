import { Injectable } from '@nestjs/common';
import { CurationRunJobDto } from './dto/curation-run-job.dto';
import { TemplateNewsSource } from './sources/template-news.source';

@Injectable()
export class CurationAgentService {
  constructor(private readonly templateNewsSource: TemplateNewsSource) {}

  discoverNews(job: CurationRunJobDto) {
    switch (job.sourceType) {
      case 'template':
        return this.templateNewsSource.generate(job.limit, job.runId);

      default:
        throw new Error(`Unsupported curation source: ${job.sourceType}`);
    }
  }
}
