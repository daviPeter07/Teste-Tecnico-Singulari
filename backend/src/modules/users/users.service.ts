import { Injectable } from '@nestjs/common';
import { InvalidUserPreferencesException } from '../../common/exceptions/invalid-user-preferences.exception';
import { UserNotFoundException } from '../../common/exceptions/user-not-found.exception';
import { PreferenceResponseDto } from '../preferences/dto/preferences-response.dto';
import { PreferencesRepository } from '../preferences/preferences.repository';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly preferencesRepository: PreferencesRepository,
  ) {}

  async findMyPreferences(userId: string): Promise<PreferenceResponseDto[]> {
    await this.ensureUserExists(userId);

    const preferences = await this.usersRepository.findPreferences(userId);

    return preferences.map(PreferenceResponseDto.fromEntity);
  }

  async updateMyPreferences(
    userId: string,
    body: UpdateUserPreferencesDto,
  ): Promise<PreferenceResponseDto[]> {
    const { categoryIds } = body;

    await this.ensureUserExists(userId);

    if (categoryIds.length > 0) {
      const categoriesCount =
        await this.preferencesRepository.countByIds(categoryIds);

      if (categoriesCount !== categoryIds.length) {
        throw new InvalidUserPreferencesException(categoryIds);
      }
    }

    const preferences = await this.usersRepository.replacePreferences(
      userId,
      categoryIds,
    );

    return preferences.map(PreferenceResponseDto.fromEntity);
  }

  private async ensureUserExists(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }
  }
}
