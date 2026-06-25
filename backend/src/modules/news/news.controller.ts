import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { NewsResponseDto } from './dto/news-response.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({
    summary: 'List news',
    description:
      'Returns a paginated list of news with optional filters by period and category.',
  })
  @ApiOkResponse({
    description: 'Paginated news list',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(NewsResponseDto),
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  findMany(@Query() query: ListNewsQueryDto) {
    return this.newsService.findMany(query);
  }
}
