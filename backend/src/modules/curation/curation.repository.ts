import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';
import { CurationRunStatus } from '../../../generated/prisma/enums';

type UpdateRunAfterEnqueueParams = {
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
        status: CurationRunStatus.RUNNING,
        sourceType,
      },
    });
  }

  updateRunAfterEnqueue(params: UpdateRunAfterEnqueueParams) {
    return this.prismaService.curationRun.update({
      where: {
        id: params.runId,
      },
      data: {
        itemsFound: params.itemsFound,
        itemsQueued: params.itemsQueued,
      },
    });
  }

  markRunAsFailed(runId: string, errorMessage: string) {
    return this.prismaService.curationRun.update({
      where: {
        id: runId,
      },

      data: {
        status: CurationRunStatus.FAILED,
        errorMessage,
        finishedAt: new Date(),
      },
    });
  }
}
