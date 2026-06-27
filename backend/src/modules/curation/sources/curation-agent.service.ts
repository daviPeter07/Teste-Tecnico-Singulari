import { Injectable } from '@nestjs/common';
import { CurationRunJobContract } from '../../../common/contracts/curation-run-job.contract';
import { TemplateNewsSource } from './template-news.source';

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
