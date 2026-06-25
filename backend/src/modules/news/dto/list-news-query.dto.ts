import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches } from 'class-validator';

import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export enum NewsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class ListNewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter news by publication period',
    enum: NewsPeriod,
    example: NewsPeriod.WEEK,
  })
  @IsOptional()
  @IsEnum(NewsPeriod)
  period?: NewsPeriod;

  @ApiPropertyOptional({
    description: 'Filter news by category slug',
    example: 'artificial-intelligence',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'category must be a valid slug',
  })
  category?: string;
}
