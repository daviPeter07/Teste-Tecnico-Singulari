import { ConsoleLogger } from '@nestjs/common';

const MUTED_CONTEXTS = new Set(['NestFactory', 'InstanceLoader']);

export class WorkerLogger extends ConsoleLogger {
  override log(message: unknown, context?: string) {
    if (context && MUTED_CONTEXTS.has(context)) {
      return;
    }

    super.log(message, context);
  }
}
