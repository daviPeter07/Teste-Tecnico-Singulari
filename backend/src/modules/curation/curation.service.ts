import { Injectable, NotFoundException } from '@nestjs/common';
import { CurationRepository } from './curation.repository';
import { RunCurationDto } from './dto/run-curation.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class CurationService {
  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly queueService: QueueService,
  ) {}

  async run(body: RunCurationDto) {
    const sourceType = body.sourceType ?? 'template';
    const limit = body.limit ?? 5;

    const run = await this.curationRepository.createRun(sourceType);

    try {
      const queuedRunJob = await this.queueService.enqueueCurationRunJob({
        runId: run.id,
        sourceType,
        limit,
      });

      return {
        id: run.id,
        status: run.status,
        sourceType: run.sourceType,
        itemsFound: run.itemsFound,
        itemsQueued: run.itemsQueued,
        itemsProcessed: run.itemsProcessed,
        itemsSaved: run.itemsSaved,
        itemsFailed: run.itemsFailed,
        startedAt: run.startedAt,
        jobId: queuedRunJob.id,
      };
    } catch (error) {
      await this.curationRepository.markRunAsFailed(
        run.id,
        error instanceof Error ? error.message : 'Curation error',
      );

      throw error;
    }
  }

  async findRunById(runId: string) {
    const run = await this.curationRepository.findRunById(runId);

    if (!run) {
      throw new NotFoundException(`Curation run ${runId} not found`);
    }

    return run;
  }
}
