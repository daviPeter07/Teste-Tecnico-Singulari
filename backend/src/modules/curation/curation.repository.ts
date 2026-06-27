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

  async registerSavedItem(runId: string) {
    return this.prismaService.curationRun.update({
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
  }

  async registerFailedItem(runId: string, errorMessage: string) {
    return this.prismaService.curationRun.update({
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
  }

  finalizeRun(runId: string, status: CurationRunStatus) {
    return this.prismaService.curationRun.update({
      where: {
        id: runId,
      },
      data: {
        status,
        finishedAt: new Date(),
      },
    });
  }
}
