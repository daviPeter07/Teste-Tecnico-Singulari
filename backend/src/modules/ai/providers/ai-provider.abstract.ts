import { Logger } from '@nestjs/common';

export abstract class AiProvider {
  abstract readonly name: string;

  async summarize(content: string): Promise<string> {
    try {
      return await this.doSummarize(content);
    } catch (error) {
      const logger = new Logger(this.constructor.name);
      logger.warn(
        `AI summarization failed for ${this.name}. Falling back to mock.`,
      );
      if (error instanceof Error) {
        logger.warn(error.message);
      }
      return this.mockSummarize(content);
    }
  }

  protected abstract doSummarize(content: string): Promise<string>;

  private mockSummarize(content: string): Promise<string> {
    if (content.length <= 180) {
      return Promise.resolve(content);
    }

    const normalized = content.replace(/\s+/g, ' ').trim();
    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const summary = sentences.slice(0, 2).join(' ').trim();

    return Promise.resolve(
      summary.length <= 180 ? summary : `${summary.slice(0, 177).trim()}...`,
    );
  }
}
