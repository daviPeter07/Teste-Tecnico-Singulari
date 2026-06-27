import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import {
  CURATION_RUN_QUEUE,
  NEWS_PROCESSING_QUEUE,
  QUEUE_JOB_NAMES,
} from './queue.constants';
import { Queue } from 'bullmq';
import { CurationJobDto } from '../curation/dto/curation-job.dto';
import { CurationRunJobDto } from '../curation/dto/curation-run-job.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(CURATION_RUN_QUEUE)
    private readonly curationRunQueue: Queue,
    @InjectQueue(NEWS_PROCESSING_QUEUE)
    private readonly newsProcessingQueue: Queue,
  ) {}

  enqueueCurationRunJob(params: CurationRunJobDto) {
    return this.curationRunQueue.add(
      QUEUE_JOB_NAMES.REQUEST_CURATION_RUN,
      params,
      {
        jobId: `curation-run-${params.runId}`,
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  prepareNewsProcessingJobs(params: CurationJobDto[]) {
    const jobsById = new Map<string, CurationJobDto>();

    for (const job of params) {
      jobsById.set(this.buildNewsProcessingJobId(job), job);
    }

    return Array.from(jobsById.values());
  }

  enqueueNewsProcessingJobs(params: CurationJobDto[]) {
    const jobs = this.prepareNewsProcessingJobs(params);

    if (jobs.length === 0) {
      return Promise.resolve([]);
    }

    return this.newsProcessingQueue.addBulk(
      jobs.map((job) => ({
        name: QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM,
        data: job,
        opts: {
          jobId: this.buildNewsProcessingJobId(job),
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      })),
    );
  }

  private buildNewsProcessingJobId(params: CurationJobDto) {
    const stableKey = (
      params.item.url ?? `${params.item.title}-${params.item.publishedAt}`
    ).replace(/:/g, '-');

    return `news-item-${params.runId}-${stableKey}`;
  }
}
