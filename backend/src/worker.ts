import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerLogger } from './common/logging/worker.logger';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: new WorkerLogger(),
  });

  const logger = new Logger('WorkerBootstrap');
  logger.log('BullMQ worker started successfully.');

  const shutdown = async () => {
    logger.log('Shutting down BullMQ worker...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  const logger = new Logger('WorkerBootstrap');
  logger.error(
    'Failed to start BullMQ worker.',
    error instanceof Error ? error.stack : undefined,
  );
  process.exit(1);
});
