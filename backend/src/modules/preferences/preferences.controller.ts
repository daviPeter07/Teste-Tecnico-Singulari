import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';
import { PreferenceResponseDto } from './dto/preferences-response.dto';
import { PreferencesService } from './preferences.service';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List available categories',
    description:
      'Returns all available news categories. Can be used for filtering and user preferences.',
  })
  @ApiOkResponse({
    description: 'Available news categories',
    type: PreferenceResponseDto,
    isArray: true,
  })
  findAll() {
    return this.preferencesService.findAll();
  }
}
