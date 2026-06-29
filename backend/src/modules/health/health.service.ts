import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { HealthRepository } from './health.repository';

type DependencyStatus = 'up' | 'down';

type DependencyCheck = {
  status: DependencyStatus;
  latencyMs: number;
};

@Injectable()
export class HealthService {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly configService: ConfigService,
  ) {}

  private async checkDatabase(): Promise<DependencyCheck> {
    const start = Date.now();
    try {
      await this.healthRepository.ping();

      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
      };
    }
  }

  private async checkRedis(): Promise<DependencyCheck> {
    const start = Date.now();
    const redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      connectTimeout: 3000,
      lazyConnect: true,
    });

    try {
      await redis.connect();
      await redis.ping();

      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
      };
    } finally {
      redis.disconnect();
    }
  }

  async check() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const allUp = database.status === 'up' && redis.status === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      service: 'newsletter-inteligente-api',
      timestamp: new Date().toISOString(),
      checks: {
        database,
        redis,
      },
    };
  }
}
