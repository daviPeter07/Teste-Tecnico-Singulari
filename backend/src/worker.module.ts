import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { CurationModule } from './modules/curation/curation.module';
import { NewsModule } from './modules/news/news.module';
import { QueueModule } from './modules/queue/queue.module';
import { NewsCurationProcessor } from './modules/curation/processors/news-curation.processor';

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
    CoreModule,
    QueueModule,
    NewsModule,
    CurationModule,
  ],
  providers: [NewsCurationProcessor],
})
export class WorkerModule {}
