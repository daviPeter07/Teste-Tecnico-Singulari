import { Injectable } from '@nestjs/common';
import { TemplateNewsSource } from './sources/template-news.source';
import { CurationRunJobContract } from '../../common/contracts/curation-run-job.contract';

@Injectable()
export class CurationAgentService {
  constructor(private readonly templateNewsSource: TemplateNewsSource) {}

  discoverNews(job: CurationRunJobContract) {
    switch (job.sourceType) {
      case 'template':
        return this.templateNewsSource.generate(job.limit, job.runId);

      default:
        throw new Error(`Unsupported curation source: ${job.sourceType}`);
    }
  }
}
