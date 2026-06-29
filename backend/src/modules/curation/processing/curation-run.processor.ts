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
    const maxAttempts = job.opts.attempts ?? 1;
    const currentAttempt = job.attemptsMade + 1;

    this.logger.log(
      `Starting curation run ${runId} from source ${sourceType} (attempt ${currentAttempt}/${maxAttempts}).`,
    );

    try {
      const runState = await this.curationRepository.markRunAsRunning(runId);

      if (this.isTerminalRun(runState.status, runState.finishedAt)) {
        this.logger.warn(
          `Skipping run ${runId} because it is already terminal with status ${runState.status}.`,
        );

        return {
          runId,
          itemsQueued: runState.itemsQueued,
          status: runState.status,
        };
      }

      const items = this.curationAgentService.discoverNews(job.data);
      this.logger.log(
        `Discovered ${items.length} items for curation run ${runId}.`,
      );

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
      this.logger.log(
        `Queued ${jobs.length} news items for curation run ${runId}.`,
      );

      await job.updateProgress(100);

      return {
        runId,
        itemsQueued: run.itemsQueued,
      };
    } catch (error) {
      const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown curation agent error';

      if (!isLastAttempt) {
        this.logger.warn(
          `Curation run ${runId} failed on attempt ${currentAttempt}/${maxAttempts}: ${errorMessage}. Retrying.`,
        );
      }

      if (isLastAttempt) {
        this.logger.error(
          `Curation run ${runId} failed after ${maxAttempts} attempts: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );

        await this.curationRepository.markRunAsFailed(runId, errorMessage);
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
