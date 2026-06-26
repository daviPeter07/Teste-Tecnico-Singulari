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
    description: 'Source used by the curation agent',
  })
  @IsOptional()
  @IsIn(['template'])
  sourceType!: 'template';
}
