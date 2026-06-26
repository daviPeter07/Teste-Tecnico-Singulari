import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { NEWS_CURATION_QUEUE, QUEUE_JOB_NAMES } from './queue.constants';
import { Queue } from 'bullmq';
import { CurationJobDto } from '../curation/dto/curation-job.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(NEWS_CURATION_QUEUE)
    private readonly newsCurationQueue: Queue,
  ) {}

  enqueueNewsCurationJob(params: CurationJobDto) {
    return this.newsCurationQueue.add(
      QUEUE_JOB_NAMES.PROCESS_NEWS_ITEM,
      params,
      {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
      },
    );
  }
}
