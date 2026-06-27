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

  findBySlug(slug: string) {
    return this.prismaService.category.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
  }

  findFallback() {
    return this.prismaService.category.findFirst({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
  }
}
