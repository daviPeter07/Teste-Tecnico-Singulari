import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CurationJobContract } from '../../../common/contracts/curation-job.contract';
import { NewsRepository } from '../../news/news.repository';
import { PreferencesRepository } from '../../preferences/preferences.repository';
import {
  NEWS_PROCESSING_QUEUE,
  QUEUE_JOB_NAMES,
} from '../../queue/queue.constants';
import { CurationRunDomain } from '../curation-run.domain';
import { CurationRepository } from '../curation.repository';
import { NewsEnrichmentService } from '../news-enrichment.service';

@Injectable()
@Processor(NEWS_PROCESSING_QUEUE)
export class NewsProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsProcessingProcessor.name);

  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly preferencesRepository: PreferencesRepository,
    private readonly newsRepository: NewsRepository,
    private readonly newsEnrichmentService: NewsEnrichmentService,
    private readonly curationRunDomain: CurationRunDomain,
  ) {
    super();
  }

  async process(job: Job<CurationJobContract>) {
    switch (job.name) {
      case QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM:
        return this.processNewsItem(job);

      default:
        this.logger.warn(`Unknown news processing job received: ${job.name}`);
        return null;
    }
  }

  private async processNewsItem(job: Job<CurationJobContract>) {
    const { runId, item } = job.data;

    try {
      const category =
        (await this.preferencesRepository.findBySlug(item.categorySlug)) ??
        (await this.preferencesRepository.findFallback());

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

      const run = await this.registerRunProgress(runId, 'saved');
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
        const run = await this.registerRunProgress(
          runId,
          'failed',
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

  private async registerRunProgress(
    runId: string,
    outcome: 'saved' | 'failed',
    errorMessage?: string,
  ) {
    const run =
      outcome === 'saved'
        ? await this.curationRepository.registerSavedItem(runId)
        : await this.curationRepository.registerFailedItem(
            runId,
            errorMessage ?? 'Unknown news processing error',
          );

    if (!this.curationRunDomain.shouldFinalize(run)) {
      return run;
    }

    return this.curationRepository.finalizeRun(
      runId,
      this.curationRunDomain.getFinalStatus(run),
    );
  }
}
