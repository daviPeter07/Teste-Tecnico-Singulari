import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto } from './dto/categories-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.findMany();

    return categories.map(CategoryResponseDto.fromEntity);
  }
}
