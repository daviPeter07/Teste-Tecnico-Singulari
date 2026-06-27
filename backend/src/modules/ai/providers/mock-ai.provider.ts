import { Injectable } from '@nestjs/common';
import { AiProvider } from './ai-provider.abstract';

@Injectable()
export class MockAiProvider extends AiProvider {
  readonly name = 'mock';

  protected async doSummarize(content: string): Promise<string> {
    if (content.length <= 180) {
      return content;
    }

    const normalized = content.replace(/\s+/g, ' ').trim();
    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const summary = sentences.slice(0, 2).join(' ').trim();

    return summary.length <= 180
      ? summary
      : `${summary.slice(0, 177).trim()}...`;
  }
}
