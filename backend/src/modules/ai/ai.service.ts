import { Inject, Injectable } from '@nestjs/common';
import { SummarizerContract } from '../curation/contracts/summarizer.contract';
import { AiProvider } from './providers/ai-provider.abstract';
import { AI_PROVIDER } from './ai.module';

@Injectable()
export class AiService implements SummarizerContract {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AiProvider) {}

  async summarize(content: string) {
    return this.provider.summarize(content);
  }
}
