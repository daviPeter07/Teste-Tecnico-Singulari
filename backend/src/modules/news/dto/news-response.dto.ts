import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { NewsCategorySummaryDto } from './news-category-summary.dto';

type NewsResponseDtoParams = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl?: string | null;
  url?: string | null;
  summary: string;
  sentiment?: string | null;
  entities?: string[] | null;
  publishedAt: Date;
  category: NewsCategorySummaryDto;
};

type NewsEntity = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string | null;
  url: string | null;
  summary: string;
  sentiment: string | null;
  entities: unknown;
  publishedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export class NewsResponseDto {
  @ApiProperty({
    example: '1b03e8a4-5bb3-44e1-9f59-d2dfc8d6734f',
  })
  id: string;

  @ApiProperty({
    example: 'Nova geração de agentes de IA ganha espaço em produtos digitais',
  })
  title: string;

  @ApiProperty({
    example: 'Tech Daily',
  })
  sourceName: string;

  @ApiPropertyOptional({
    example: 'https://techdaily.example.com',
    nullable: true,
  })
  sourceUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://techdaily.example.com/news/ai-agents',
    nullable: true,
  })
  url?: string | null;

  @ApiProperty({
    example:
      'Empresas estão adotando agentes de IA para automatizar fluxos de atendimento, análise e produtividade.',
  })
  summary: string;

  @ApiPropertyOptional({
    example: 'POSITIVE',
    nullable: true,
  })
  sentiment?: string | null;

  @ApiPropertyOptional({
    example: ['OpenAI', 'Google Cloud', 'NestJS'],
    type: [String],
    nullable: true,
  })
  entities?: string[] | null;

  @ApiProperty({
    example: '2026-06-23T10:00:00.000Z',
  })
  publishedAt: Date;

  @ApiProperty({
    type: NewsCategorySummaryDto,
  })
  category: NewsCategorySummaryDto;

  constructor(params: NewsResponseDtoParams) {
    this.id = params.id;
    this.title = params.title;
    this.sourceName = params.sourceName;
    this.sourceUrl = params.sourceUrl;
    this.url = params.url;
    this.summary = params.summary;
    this.sentiment = params.sentiment;
    this.entities = params.entities;
    this.publishedAt = params.publishedAt;
    this.category = params.category;
  }

  static fromEntity(news: NewsEntity): NewsResponseDto {
    return new NewsResponseDto({
      id: news.id,
      title: news.title,
      sourceName: news.sourceName,
      sourceUrl: news.sourceUrl,
      url: news.url,
      summary: news.summary,
      sentiment: news.sentiment,
      entities: NewsResponseDto.mapEntities(news.entities),
      publishedAt: news.publishedAt,
      category: NewsCategorySummaryDto.fromEntity(news.category),
    });
  }

  private static mapEntities(entities: unknown): string[] | null {
    if (!Array.isArray(entities)) {
      return null;
    }

    return entities.filter(
      (entity): entity is string => typeof entity === 'string',
    );
  }
}
