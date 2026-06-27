import { Injectable } from '@nestjs/common';
import { CurationRunJobContract } from '../../../common/contracts/curation-run-job.contract';
import { LocalJsonNewsSource } from './local-json-news.source';
import { TemplateNewsSource } from './template-news.source';

@Injectable()
export class CurationAgentService {
  constructor(
    private readonly templateNewsSource: TemplateNewsSource,
    private readonly localJsonNewsSource: LocalJsonNewsSource,
  ) {}

  discoverNews(job: CurationRunJobContract) {
    switch (job.sourceType) {
      case 'template':
        return this.templateNewsSource.generate(job.limit, job.runId);

      case 'local-json':
        return this.localJsonNewsSource.generate(job.limit, job.runId);

      default:
        throw new Error(`Unsupported curation source: ${job.sourceType}`);
    }
  }
}
