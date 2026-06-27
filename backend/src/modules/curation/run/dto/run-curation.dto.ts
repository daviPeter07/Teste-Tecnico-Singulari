import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, Max, Min } from 'class-validator';

export class RunCurationDto {
  @ApiPropertyOptional({
    example: 5,
    default: 5,
    minimum: 1,
    maximum: 20,
    description: 'Number of items to generate and enqueue',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limit!: number;

  @ApiPropertyOptional({
    example: 'template',
    default: 'template',
    enum: ['template', 'local-json'],
    description: 'Source used by the curation agent (template or local-json)',
  })
  @IsOptional()
  @IsIn(['template', 'local-json'])
  sourceType!: 'template' | 'local-json';
}
