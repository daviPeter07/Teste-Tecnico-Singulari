import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { NEWS_CURATION_QUEUE, QUEUE_JOB_NAMES } from './queue.constants';
import { Queue } from 'bullmq';

type EnqueueNewsCurationJobParams = {
  runId: string;
  sourceType: string;
  item: {
    title: string;
    sourceName: string;
    sourceUrl: string | null;
    url?: string | null;
    content: string;
    publishedAt: Date;
    categorySlug: string;
  };
};
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(NEWS_CURATION_QUEUE)
    private readonly newsCurationQueue: Queue,
  ) {}

  enqueueNewsCurationJob(params: EnqueueNewsCurationJobParams) {
    return this.newsCurationQueue.add(
      QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM,
      params,
      {
        removeOnComplete: 100,
        removeOnFail: 3,
        attempts: 3,
      },
    );
  }
}
