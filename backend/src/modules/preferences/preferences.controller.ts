import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PreferenceResponseDto } from './dto/preferences-response.dto';
import { PreferencesService } from './preferences.service';

@ApiTags('Preferences')
@ApiBearerAuth('jwt')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({
    summary: 'List available preferences',
    description:
      'Returns all available news categories that can be used as user preferences.',
  })
  @ApiOkResponse({
    description: 'Available news categories for preferences',
    type: PreferenceResponseDto,
    isArray: true,
  })
  findAll() {
    return this.preferencesService.findAll();
  }
}
