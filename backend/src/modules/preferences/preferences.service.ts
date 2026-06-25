import { Injectable } from '@nestjs/common';
import { PreferencesRepository } from './preferences.repository';
import { PreferenceResponseDto } from './dto/preferences-response.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly preferencesRepository: PreferencesRepository) {}

  async findAll(): Promise<PreferenceResponseDto[]> {
    const categories = await this.preferencesRepository.findMany();

    return categories.map(PreferenceResponseDto.fromEntity);
  }
}
