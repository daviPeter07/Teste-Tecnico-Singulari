import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user.type';
import { PreferenceResponseDto } from '../preferences/dto/preferences-response.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/preferences')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiOkResponse({
    description: 'Current user preferences',
    type: PreferenceResponseDto,
    isArray: true,
  })
  findMyPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMyPreferences(user.id);
  }

  @Put('me/preferences')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Replace current user preferences' })
  @ApiOkResponse({
    description: 'Updated current user preferences',
    type: PreferenceResponseDto,
    isArray: true,
  })
  updateMyPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserPreferencesDto,
  ) {
    return this.usersService.updateMyPreferences(user.id, body);
  }
}
