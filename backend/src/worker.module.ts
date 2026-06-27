import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { configModuleOptions } from './config/config-module.factory';
import { AiModule } from './modules/ai/ai.module';
import { CurationModule } from './modules/curation/curation.module';
import { NewsModule } from './modules/news/news.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AiModule,
    CoreModule,
    QueueModule,
    NewsModule,
    CurationModule,
  ],
})
export class WorkerModule {}
