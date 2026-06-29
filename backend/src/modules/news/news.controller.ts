import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';
import { NewsResponseDto } from './dto/news-response.dto';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user.type';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List news',
    description:
      'Returns a paginated list of news with optional filters by period and category. If authenticated, filters by user preferences.',
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
  findMany(
    @Query() query: ListNewsQueryDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.newsService.findMany(query, user);
  }
}
