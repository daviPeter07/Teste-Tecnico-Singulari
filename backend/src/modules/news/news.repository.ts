import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaRepository } from '../../database/prisma.repository';
import { Prisma } from '../../../generated/prisma/client';

type FindManyNewsParams = {
  skip: number;
  take: number;
  publishedAtFrom?: Date;
  categorySlug?: string;
};

type CountNewsParams = Omit<FindManyNewsParams, 'skip' | 'take'>;

@Injectable()
export class NewsRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  async findMany(params: FindManyNewsParams) {
    const where = this.buildWhere(params);

    return this.prismaService.news.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
  async count(params: CountNewsParams) {
    const where = this.buildWhere(params);

    return this.prismaService.news.count({
      where,
    });
  }

  private buildWhere(params: CountNewsParams): Prisma.NewsWhereInput {
    const where: Prisma.NewsWhereInput = {};

    if (params.publishedAtFrom) {
      where.publishedAt = {
        gte: params.publishedAtFrom,
      };
    }

    if (params.categorySlug) {
      where.category = {
        is: {
          slug: params.categorySlug,
        },
      };
    }

    return where;
  }
}
