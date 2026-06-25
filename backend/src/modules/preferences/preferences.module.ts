import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { PreferencesRepository } from './preferences.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PreferencesController],
  providers: [PreferencesService, PreferencesRepository],
  exports: [PreferencesService, PreferencesRepository],
})
export class PreferencesModule {}
