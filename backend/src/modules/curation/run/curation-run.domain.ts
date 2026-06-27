import { Injectable } from '@nestjs/common';
import { CurationRunStatus } from '../../../../generated/prisma/enums';

type CurationRunProgress = {
  itemsFailed: number;
  itemsProcessed: number;
  itemsQueued: number;
  itemsSaved: number;
};

@Injectable()
export class CurationRunDomain {
  shouldFinalize(
    run: Pick<CurationRunProgress, 'itemsProcessed' | 'itemsQueued'>,
  ) {
    return run.itemsQueued > 0 && run.itemsProcessed >= run.itemsQueued;
  }

  getFinalStatus(run: Pick<CurationRunProgress, 'itemsFailed' | 'itemsSaved'>) {
    if (run.itemsFailed === 0) {
      return CurationRunStatus.COMPLETED;
    }

    return run.itemsSaved > 0
      ? CurationRunStatus.PARTIAL
      : CurationRunStatus.FAILED;
  }
}
