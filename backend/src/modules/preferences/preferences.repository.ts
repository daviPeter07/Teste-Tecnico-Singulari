import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaRepository } from '../../database/prisma.repository';

@Injectable()
export class PreferencesRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  findMany() {
    return this.prismaService.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  countByIds(ids: string[]) {
    return this.prismaService.category.count({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
