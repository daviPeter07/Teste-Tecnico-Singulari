import { InvalidUserPreferencesException } from '../../common/exceptions/invalid-user-preferences.exception';
import { UserNotFoundException } from '../../common/exceptions/user-not-found.exception';
import { PreferencesRepository } from '../preferences/preferences.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('../preferences/preferences.repository', () => ({
  PreferencesRepository: class PreferencesRepository {},
}));

jest.mock('./users.repository', () => ({
  UsersRepository: class UsersRepository {},
}));

describe('UsersService', () => {
  const userId = 'user-1';
  const categories = [
    {
      id: 'cat-1',
      name: 'Backend',
      slug: 'backend',
      description: 'Backend news',
    },
    {
      id: 'cat-2',
      name: 'AI',
      slug: 'artificial-intelligence',
      description: 'AI news',
    },
  ];

  let service: UsersService;
  let usersRepository: jest.Mocked<
    Pick<UsersRepository, 'findById' | 'findPreferences' | 'replacePreferences'>
  >;
  let preferencesRepository: jest.Mocked<
    Pick<PreferencesRepository, 'countByIds'>
  >;

  beforeEach(() => {
    usersRepository = {
      findById: jest.fn(),
      findPreferences: jest.fn(),
      replacePreferences: jest.fn(),
    };
    preferencesRepository = {
      countByIds: jest.fn(),
    };

    service = new UsersService(
      usersRepository as unknown as UsersRepository,
      preferencesRepository as unknown as PreferencesRepository,
    );
  });

  it('loads the authenticated user preferences after confirming the user exists', async () => {
    // Garante que as preferencias so sao lidas depois de validar que o usuario existe.
    usersRepository.findById.mockResolvedValue({ id: userId } as never);
    usersRepository.findPreferences.mockResolvedValue(categories as never);

    const result = await service.findMyPreferences(userId);

    expect(usersRepository.findById).toHaveBeenCalledWith(userId);
    expect(usersRepository.findPreferences).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({ id: 'cat-1', slug: 'backend' }),
    );
  });

  it('rejects preference reads when the user does not exist', async () => {
    // Mantem o contrato explicito de erro quando o usuario nao existe.
    usersRepository.findById.mockResolvedValue(null);

    await expect(service.findMyPreferences(userId)).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('validates all category ids before replacing user preferences', async () => {
    // Evita salvar preferencias parcialmente quando existe categoryId invalido no payload.
    usersRepository.findById.mockResolvedValue({ id: userId } as never);
    preferencesRepository.countByIds.mockResolvedValue(1);

    await expect(
      service.updateMyPreferences(userId, {
        categoryIds: ['cat-1', 'cat-2'],
      }),
    ).rejects.toBeInstanceOf(InvalidUserPreferencesException);

    expect(usersRepository.replacePreferences).not.toHaveBeenCalled();
  });

  it('allows replacing preferences with an empty list to clear the current selection', async () => {
    // Cobre o caso de limpar todas as preferencias sem fazer validacao desnecessaria.
    usersRepository.findById.mockResolvedValue({ id: userId } as never);
    usersRepository.replacePreferences.mockResolvedValue([] as never);

    const result = await service.updateMyPreferences(userId, {
      categoryIds: [],
    });

    expect(preferencesRepository.countByIds).not.toHaveBeenCalled();
    expect(usersRepository.replacePreferences).toHaveBeenCalledWith(userId, []);
    expect(result).toEqual([]);
  });
});
