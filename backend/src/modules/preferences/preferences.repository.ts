import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaRepository } from '../../database/prisma.repository';

@Injectable()
export class PreferencesRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  async findMany() {
    return this.prismaService.category.findMany({
      orderBy: {
        name: 'asc',
      }
    });
  }
}
