import { Injectable } from '@nestjs/common';
import { CurationRunStatus } from '../../../generated/prisma/enums';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';

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

  async registerProcessedItem(runId: string) {
    return this.prismaService.$transaction(async (transaction) => {
      const currentRun = await transaction.curationRun.findUniqueOrThrow({
        where: {
          id: runId,
        },
      });

      const nextItemsSaved = currentRun.itemsSaved + 1;
      const shouldComplete =
        currentRun.itemsQueued > 0 && nextItemsSaved >= currentRun.itemsQueued;

      return transaction.curationRun.update({
        where: {
          id: runId,
        },
        data: {
          itemsSaved: {
            increment: 1,
          },
          status: shouldComplete ? CurationRunStatus.COMPLETED : undefined,
          finishedAt: shouldComplete ? new Date() : undefined,
        },
      });
    });
  }

  markRunAsFailedByJob(runId: string, errorMessage: string) {
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
