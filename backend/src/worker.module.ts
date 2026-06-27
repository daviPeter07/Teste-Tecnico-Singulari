import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { configModuleOptions } from './config/config-module.factory';
import { ProcessingModule } from './modules/curation/processing/processing.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    CoreModule,
    ProcessingModule,
  ],
})
export class WorkerModule {}
