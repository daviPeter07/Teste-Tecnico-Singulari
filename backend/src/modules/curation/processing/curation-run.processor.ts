import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CurationRunStatus } from '../../../../generated/prisma/enums';
import { QueueService } from '../../queue/queue.service';
import {
  CURATION_RUN_QUEUE,
  QUEUE_JOB_NAMES,
} from '../../queue/queue.constants';
import { CurationRunJobContract } from '../../../common/contracts/curation-run-job.contract';
import { CurationAgentService } from '../sources/curation-agent.service';
import { CurationRepository } from '../run/curation.repository';

@Injectable()
@Processor(CURATION_RUN_QUEUE)
export class CurationRunProcessor extends WorkerHost {
  private readonly logger = new Logger(CurationRunProcessor.name);

  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly curationAgentService: CurationAgentService,
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<CurationRunJobContract>) {
    switch (job.name) {
      case QUEUE_JOB_NAMES.REQUEST_CURATION_RUN:
        return this.processRequestedRun(job);

      default:
        this.logger.warn(`Unknown curation run job received: ${job.name}`);
        return null;
    }
  }

  private async processRequestedRun(job: Job<CurationRunJobContract>) {
    const { runId, sourceType } = job.data;

    try {
      const runState = await this.curationRepository.markRunAsRunning(runId);

      if (this.isTerminalRun(runState.status, runState.finishedAt)) {
        return {
          runId,
          itemsQueued: runState.itemsQueued,
          status: runState.status,
        };
      }

      const items = this.curationAgentService.discoverNews(job.data);
      const jobs = this.queueService.prepareNewsProcessingJobs(
        items.map((item) => ({
          runId,
          sourceType,
          item,
        })),
      );

      const run = await this.curationRepository.updateRunAfterDiscovery({
        runId,
        itemsFound: items.length,
        itemsQueued: jobs.length,
      });

      await this.queueService.enqueueNewsProcessingJobs(jobs);

      await job.updateProgress(100);

      return {
        runId,
        itemsQueued: run.itemsQueued,
      };
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;

      if (isLastAttempt) {
        await this.curationRepository.markRunAsFailed(
          runId,
          error instanceof Error
            ? error.message
            : 'Unknown curation agent error',
        );
      }

      throw error;
    }
  }

  private isTerminalRun(status: CurationRunStatus, finishedAt: Date | null) {
    return (
      finishedAt !== null &&
      status !== CurationRunStatus.QUEUED &&
      status !== CurationRunStatus.RUNNING
    );
  }
}
