import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

type DependencyStatus = 'up' | 'down';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  //metodo pra exec query e retorna latency
  private async checkDatabase(): Promise<{
    status: DependencyStatus;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
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
