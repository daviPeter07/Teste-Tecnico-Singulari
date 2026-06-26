import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NewsRepository } from '../../news/news.repository';
import {
  NEWS_PROCESSING_QUEUE,
  QUEUE_JOB_NAMES,
} from '../../queue/queue.constants';
import { CurationRepository } from '../curation.repository';
import { CurationJobDto } from '../dto/curation-job.dto';
import { NewsEnrichmentService } from '../news-enrichment.service';

@Injectable()
@Processor(NEWS_PROCESSING_QUEUE)
export class NewsProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsProcessingProcessor.name);

  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly newsRepository: NewsRepository,
    private readonly newsEnrichmentService: NewsEnrichmentService,
  ) {
    super();
  }

  async process(job: Job<CurationJobDto>) {
    switch (job.name) {
      case QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM:
        return this.processNewsItem(job);

      default:
        this.logger.warn(`Unknown news processing job received: ${job.name}`);
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
        summary: await this.newsEnrichmentService.summarize(item.content),
        sentiment: this.newsEnrichmentService.detectSentiment(item.content),
        entities: this.newsEnrichmentService.extractEntities(item.content),
        publishedAt: new Date(item.publishedAt),
        categoryId: category.id,
      });

      const run = await this.curationRepository.registerSavedItem(runId);
      await job.updateProgress(
        run.itemsQueued > 0
          ? Math.round((run.itemsProcessed / run.itemsQueued) * 100)
          : 100,
      );

      return {
        runId,
        categorySlug: category.slug,
      };
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;

      if (isLastAttempt) {
        const run = await this.curationRepository.registerFailedItem(
          runId,
          error instanceof Error
            ? error.message
            : 'Unknown news processing error',
        );

        await job.updateProgress(
          run.itemsQueued > 0
            ? Math.round((run.itemsProcessed / run.itemsQueued) * 100)
            : 100,
        );
      }

      throw error;
    }
  }
}
