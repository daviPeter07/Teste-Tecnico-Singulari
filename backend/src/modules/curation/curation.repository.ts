import { Injectable } from '@nestjs/common';
import { CurationRunStatus } from '../../../generated/prisma/enums';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';

type UpdateRunAfterDiscoveryParams = {
  runId: string;
  itemsFound: number;
  itemsQueued: number;
};

@Injectable()
export class CurationRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  createRun(sourceType: string) {
    return this.prismaService.curationRun.create({
      data: {
        status: CurationRunStatus.QUEUED,
        sourceType,
      },
    });
  }

  findRunById(runId: string) {
    return this.prismaService.curationRun.findUnique({
      where: {
        id: runId,
      },
    });
  }

  async markRunAsRunning(runId: string) {
    await this.prismaService.curationRun.updateMany({
      where: {
        id: runId,
        status: {
          in: [CurationRunStatus.QUEUED, CurationRunStatus.RUNNING],
        },
      },
      data: {
        status: CurationRunStatus.RUNNING,
        errorMessage: null,
        finishedAt: null,
      },
    });

    return this.prismaService.curationRun.findUniqueOrThrow({
      where: {
        id: runId,
      },
    });
  }

  async updateRunAfterDiscovery(params: UpdateRunAfterDiscoveryParams) {
    const run = await this.prismaService.curationRun.update({
      where: {
        id: params.runId,
      },
      data: {
        itemsFound: params.itemsFound,
        itemsQueued: params.itemsQueued,
      },
    });

    if (run.itemsQueued === 0) {
      return this.prismaService.curationRun.update({
        where: {
          id: params.runId,
        },
        data: {
          status: CurationRunStatus.COMPLETED,
          finishedAt: new Date(),
        },
      });
    }

    return run;
  }

  async markRunAsFailed(runId: string, errorMessage: string) {
    await this.prismaService.curationRun.updateMany({
      where: {
        id: runId,
        status: {
          in: [CurationRunStatus.QUEUED, CurationRunStatus.RUNNING],
        },
      },

      data: {
        status: CurationRunStatus.FAILED,
        errorMessage,
        finishedAt: new Date(),
      },
    });

    return this.prismaService.curationRun.findUniqueOrThrow({
      where: {
        id: runId,
      },
    });
  }

  findCategoryBySlug(slug: string) {
    return this.prismaService.category.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
  }

  findFallbackCategory() {
    return this.prismaService.category.findFirst({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
  }

  async registerSavedItem(runId: string) {
    const run = await this.prismaService.curationRun.update({
      where: {
        id: runId,
      },
      data: {
        itemsProcessed: {
          increment: 1,
        },
        itemsSaved: {
          increment: 1,
        },
      },
    });

    return this.finalizeRunIfNeeded(runId, run);
  }

  async registerFailedItem(runId: string, errorMessage: string) {
    const run = await this.prismaService.curationRun.update({
      where: {
        id: runId,
      },
      data: {
        itemsProcessed: {
          increment: 1,
        },
        itemsFailed: {
          increment: 1,
        },
        errorMessage,
      },
    });

    return this.finalizeRunIfNeeded(runId, run);
  }

  private async finalizeRunIfNeeded(
    runId: string,
    run: {
      itemsFailed: number;
      itemsProcessed: number;
      itemsQueued: number;
      itemsSaved: number;
    },
  ) {
    if (run.itemsQueued === 0 || run.itemsProcessed < run.itemsQueued) {
      return this.prismaService.curationRun.findUniqueOrThrow({
        where: {
          id: runId,
        },
      });
    }

    return this.prismaService.curationRun.update({
      where: {
        id: runId,
      },
      data: {
        status: this.getFinalStatus(run),
        finishedAt: new Date(),
      },
    });
  }

  private getFinalStatus(run: { itemsFailed: number; itemsSaved: number }) {
    if (run.itemsFailed === 0) {
      return CurationRunStatus.COMPLETED;
    }

    return run.itemsSaved > 0
      ? CurationRunStatus.PARTIAL
      : CurationRunStatus.FAILED;
  }
}
