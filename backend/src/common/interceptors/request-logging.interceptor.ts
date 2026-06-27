import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      params?: Record<string, string>;
    }>();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: (payload) => {
          const duration = Date.now() - startedAt;
          const trackedId = this.extractTrackedId(payload, request.params);

          this.logger.log(
            `${request.method} ${request.originalUrl ?? request.url} completed with status ${response.statusCode} in ${duration}ms${trackedId ? ` (id=${trackedId})` : ''}.`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startedAt;
          const status =
            typeof error?.getStatus === 'function' ? error.getStatus() : 500;

          this.logger.error(
            `${request.method} ${request.originalUrl ?? request.url} failed with status ${status} in ${duration}ms.`,
            error instanceof Error ? error.stack : undefined,
          );
        },
      }),
    );
  }

  private extractTrackedId(
    payload: unknown,
    params?: Record<string, string>,
  ): string | undefined {
    if (payload && typeof payload === 'object' && 'id' in payload) {
      const identifier = (payload as { id?: unknown }).id;

      return typeof identifier === 'string' ? identifier : undefined;
    }

    return params?.id;
  }
}
