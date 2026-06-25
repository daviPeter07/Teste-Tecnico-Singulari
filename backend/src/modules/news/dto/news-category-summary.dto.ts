import { ApiProperty } from '@nestjs/swagger';

type NewsCategorySummaryDtoParams = {
  id: string;
  name: string;
  slug: string;
};

export class NewsCategorySummaryDto {
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

  constructor(params: NewsCategorySummaryDtoParams) {
    this.id = params.id;
    this.name = params.name;
    this.slug = params.slug;
  }

  //mapper
  static fromEntity(
    category: NewsCategorySummaryDtoParams,
  ): NewsCategorySummaryDto {
    return new NewsCategorySummaryDto({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });
  }
}
