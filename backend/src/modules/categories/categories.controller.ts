import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/categories-response.dto';

@ApiTags('Preferences')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }
  
  @Get()
  @ApiOperation({
    summary: 'List available news categories',
    description: 'Returns all available news categories that can be used as user preferences.'
  })
  @ApiOkResponse({
    description: 'Available news categories',
    type: CategoryResponseDto,
    isArray: true,
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}
