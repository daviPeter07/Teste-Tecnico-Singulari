import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NewsSentiment } from '../../../../generated/prisma/enums';
import { NewsRepository } from '../../news/news.repository';
import {
  NEWS_CURATION_QUEUE,
  QUEUE_JOB_NAMES,
} from '../../queue/queue.constants';
import { CurationRepository } from '../curation.repository';
import { CurationJobDto } from '../dto/curation-job.dto';

@Injectable()
@Processor(NEWS_CURATION_QUEUE)
export class NewsCurationProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsCurationProcessor.name);

  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly newsRepository: NewsRepository,
  ) {
    super();
  }

  async process(job: Job<CurationJobDto>) {
    switch (job.name) {
      case QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM:
        return this.processNewsItem(job);

      default:
        this.logger.warn(`Unknown curation job received: ${job.name}`);
        return null;
    }
  }

  private async processNewsItem(job: Job<CurationJobDto>) {
    const { runId, item } = job.data;

    try {
      const category =
        (await this.curationRepository.findCategoryBySlug(item.categorySlug)) ??
        (await this.curationRepository.findFallbackCategory());

      if (!category) {
        throw new Error('No category available to persist curated news.');
      }

      await this.newsRepository.upsertCuratedNews({
        title: item.title,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        url: item.url,
        content: item.content,
        summary: this.createSummary(item.content),
        sentiment: NewsSentiment.NEUTRAL,
        entities: this.extractEntities(item.content),
        publishedAt: new Date(item.publishedAt),
        categoryId: category.id,
      });

      const run = await this.curationRepository.registerProcessedItem(runId);
      await job.updateProgress(
        run.itemsQueued > 0
          ? Math.round((run.itemsSaved / run.itemsQueued) * 100)
          : 100,
      );

      return {
        runId,
        categorySlug: category.slug,
      };
    } catch (error) {
      await this.curationRepository.markRunAsFailedByJob(
        runId,
        error instanceof Error
          ? error.message
          : 'Unknown curation processor error',
      );

      throw error;
    }
  }

  private createSummary(content: string) {
    if (content.length <= 160) {
      return content;
    }

    return `${content.slice(0, 157).trim()}...`;
  }

  private extractEntities(content: string) {
    const matches =
      content.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g) ?? [];
    const uniqueMatches = Array.from(new Set(matches));

    return uniqueMatches.slice(0, 5);
  }
}
