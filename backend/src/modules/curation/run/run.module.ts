import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { QueueModule } from '../../queue/queue.module';
import { CurationController } from './curation.controller';
import { CurationRunDomain } from './curation-run.domain';
import { CurationRepository } from './curation.repository';
import { CurationService } from './curation.service';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [CurationController],
  providers: [CurationRunDomain, CurationRepository, CurationService],
  exports: [CurationRunDomain, CurationRepository, CurationService],
})
export class RunModule {}
