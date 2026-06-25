import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type CategoryResponseDtoParams = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export class CategoryResponseDto {
  @ApiProperty({
    example: 'b8f8c3f7-6f4d-4e43-91d2-4d1f9b3c6d15',
  })
  id: string;

  @ApiProperty({
    example: 'Inteligência Artificial',
  })
  name: string;

  @ApiProperty({
    example: 'artificial-intelligence',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Notícias sobre IA, LLMs, automação e agentes inteligentes.',
  })
  description?: string | null;

  constructor(params: CategoryResponseDtoParams) {
    this.id = params.id;
    this.name = params.name;
    this.slug = params.slug;
    this.description = params.description;
  }

  //mapper
  static fromEntity(category: CategoryResponseDtoParams): CategoryResponseDto {
    return new CategoryResponseDto({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
  }
}
