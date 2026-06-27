import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  ping() {
    return this.prismaService.$queryRaw`SELECT 1`;
  }
}
