import { Injectable } from '@nestjs/common';
import { HealthRepository } from './health.repository';

type DependencyStatus = 'up' | 'down';

@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  //metodo pra exec query e retorna latency
  private async checkDatabase(): Promise<{
    status: DependencyStatus;
    latencyMs: number;
  }> {
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

  async check() {
    const database = await this.checkDatabase();

    return {
      status: database.status === 'up' ? 'ok' : 'degraded',
      service: 'newsletter-inteligente-api',
      timestamp: new Date().toISOString(),
      check: {
        database,
      },
    };
  }
}
