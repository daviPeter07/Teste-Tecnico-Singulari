import { Injectable } from '@nestjs/common';
import { CurationRepository } from './curation.repository';
import { RunCurationDto } from './dto/run-curation.dto';
import { QueueService } from '../queue/queue.service';
import { TemplateNewsSource } from './sources/template-news.source';

@Injectable()
export class CurationService {
  constructor(
    private readonly curationRepository: CurationRepository,
    private readonly templateNewsSource: TemplateNewsSource,
    private readonly queueService: QueueService,
  ) {}

  async run(body: RunCurationDto) {
    const sourceType = body.sourceType ?? 'template';
    const limit = body.limit ?? 5;

    const run = await this.curationRepository.createRun(sourceType);

    try {
      const items = this.templateNewsSource.generate(limit);

      for (const item of items) {
        await this.queueService.enqueueNewsCurationJob({
          runId: run.id,
          sourceType,
          item,
        });
      }

      const updatedRun = await this.curationRepository.updateRunAfterEnqueue({
        runId: run.id,
        itemsFound: items.length,
        itemsQueued: items.length,
      });

      return {
        id: updatedRun.id,
        status: updatedRun.status,
        sourceType: updatedRun.sourceType,
        itemsFound: updatedRun.itemsFound,
        itemsQueued: updatedRun.itemsQueued,
        itemsSaved: updatedRun.itemsSaved,
        startedAt: updatedRun.startedAt,
      };
    } catch (error) {
      await this.curationRepository.markRunAsFailed(
        run.id,
        error instanceof Error ? error.message : 'Curation error',
      );

      throw error;
    }
  }
}
