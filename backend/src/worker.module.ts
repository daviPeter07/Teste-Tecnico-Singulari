import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { AiModule } from './modules/ai/ai.module';
import { CurationModule } from './modules/curation/curation.module';
import { NewsModule } from './modules/news/news.module';
import { QueueModule } from './modules/queue/queue.module';
import { CurationRunProcessor } from './modules/curation/processors/curation-run.processor';
import { NewsProcessingProcessor } from './modules/curation/processors/news-processing.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    AiModule,
    CoreModule,
    QueueModule,
    NewsModule,
    CurationModule,
  ],
  providers: [CurationRunProcessor, NewsProcessingProcessor],
})
export class WorkerModule {}
