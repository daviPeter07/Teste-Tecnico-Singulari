import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrismaRepository } from '../../database/prisma.repository';
import { Prisma } from '../../../generated/prisma/client';
import type { NewsSentiment } from '../../../generated/prisma/enums';

type FindManyNewsParams = {
  skip: number;
  take: number;
  publishedAtFrom?: Date;
  categorySlug?: string;
};

type UpsertCuratedNewsParams = {
  title: string;
  sourceName: string;
  sourceUrl?: string | null;
  url?: string | null;
  content: string;
  summary: string;
  sentiment?: NewsSentiment | null;
  entities?: string[] | null;
  publishedAt: Date;
  categoryId: string;
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

  upsertCuratedNews(params: UpsertCuratedNewsParams) {
    const data = {
      title: params.title,
      sourceName: params.sourceName,
      sourceUrl: params.sourceUrl,
      url: params.url,
      content: params.content,
      summary: params.summary,
      sentiment: params.sentiment,
      entities: params.entities ?? undefined,
      publishedAt: params.publishedAt,
      category: {
        connect: {
          id: params.categoryId,
        },
      },
    };

    if (!params.url) {
      return this.prismaService.news.create({
        data,
      });
    }

    return this.prismaService.news.upsert({
      where: {
        url: params.url,
      },
      update: data,
      create: data,
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
