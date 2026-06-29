import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../../database/database.module';
import { HealthRepository } from './health.repository';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
})
export class HealthModule {}
