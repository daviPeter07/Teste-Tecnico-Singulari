import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { NewsModule } from './modules/news/news.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { UsersModule } from './modules/users/users.module';
import { QueueModule } from './modules/queue/queue.module';
import { CurationModule } from './modules/curation/curation.module';

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
    AuthModule,
    HealthModule,
    NewsModule,
    PreferencesModule,
    UsersModule,
    QueueModule,
    CurationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
