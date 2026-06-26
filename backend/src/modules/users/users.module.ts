import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, PreferencesModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
