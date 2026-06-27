import { Inject, Injectable, Logger } from '@nestjs/common';
import type { SummarizerContract } from '../curation/enrichment/contracts/summarizer.contract';
import { AiProvider } from './providers/ai-provider.abstract';
import { AI_PROVIDER } from './ai.constants';

@Injectable()
export class AiService implements SummarizerContract {
  private readonly logger = new Logger(AiService.name);

  constructor(@Inject(AI_PROVIDER) private readonly provider: AiProvider) {
    this.logger.log(`AI summarizer provider selected: ${provider.name}`);
  }

  async summarize(content: string) {
    return this.provider.summarize(content);
  }
}
