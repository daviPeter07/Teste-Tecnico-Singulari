import { Injectable } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import { ListNewsQueryDto, NewsPeriod } from './dto/list-news-query.dto';
import { PaginatedResponse } from '../../common/pagination/pagination-response.type';
import { NewsResponseDto } from './dto/news-response.dto';
import {
  createPaginatedResponse,
  getPaginationParams,
} from '../../common/pagination/pagination.util';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async findMany(
    query: ListNewsQueryDto,
  ): Promise<PaginatedResponse<NewsResponseDto>> {
    const { page, limit, skip, take } = getPaginationParams(query);

    const filters = {
      publishedAtFrom: this.getPublishedAtFrom(query.period),
      categorySlug: query.category,
    };

    const [news, total] = await Promise.all([
      this.newsRepository.findMany({
        skip,
        take,
        ...filters,
      }),
      this.newsRepository.count(filters),
    ]);

    return createPaginatedResponse(news.map(NewsResponseDto.fromEntity), {
      page,
      limit,
      total,
    });
  }

  private getPublishedAtFrom(period?: NewsPeriod): Date | undefined {
    if (!period) {
      return undefined;
    }

    const date = new Date();

    switch (period) {
      case NewsPeriod.DAY:
        date.setDate(date.getDate() - 1);
        return date;

      case NewsPeriod.WEEK:
        date.setDate(date.getDate() - 7);
        return date;

      case NewsPeriod.MONTH:
        date.setMonth(date.getMonth() - 1);
        return date;
    }
  }
}
