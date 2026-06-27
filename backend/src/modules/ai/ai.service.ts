import { Inject, Injectable } from '@nestjs/common';
import { AiProvider } from './providers/ai-provider.abstract';
import { AI_PROVIDER } from './ai.module';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AiProvider) {}

  async summarize(content: string) {
    return this.provider.summarize(content);
  }
}
