import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EmailAlreadyInUseException } from '../../common/exceptions/email-already-in-use.exception';
import { InvalidCredentialsException } from '../../common/exceptions/invalid-credentials.exception';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

jest.mock('./auth.repository', () => ({
  AuthRepository: class AuthRepository {},
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('AuthService', () => {
  const now = new Date('2026-06-26T12:00:00.000Z');
  const user = {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed-password',
    createdAt: now,
    updatedAt: now,
  };

  let service: AuthService;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'decode'>>;
  let authRepository: jest.Mocked<
    Pick<
      AuthRepository,
      | 'findUserByEmail'
      | 'createUser'
      | 'createSession'
      | 'revokeSession'
      | 'findUserById'
    >
  >;

  const bcryptHashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const bcryptCompareMock = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;
  const randomUUIDMock = randomUUID as jest.MockedFunction<typeof randomUUID>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    };

    authRepository = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      createSession: jest.fn(),
      revokeSession: jest.fn(),
      findUserById: jest.fn(),
    };

    service = new AuthService(
      jwtService as JwtService,
      authRepository as unknown as AuthRepository,
    );

    bcryptHashMock.mockReset();
    bcryptCompareMock.mockReset();
    randomUUIDMock.mockReset();
    randomUUIDMock.mockReturnValue('session-1');
    jwtService.signAsync.mockResolvedValue('jwt-token');
    jwtService.decode.mockReturnValue({ exp: 1_800_000_000 });
    authRepository.createSession.mockResolvedValue(undefined as never);
  });

  it('rejects registration when the email is already in use', async () => {
    // Garante que o cadastro falha quando o email ja pertence a outro usuario.
    authRepository.findUserByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        name: user.name,
        email: user.email,
        password: 'strong-password',
        confirmPassword: 'strong-password',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseException);

    expect(authRepository.createUser).not.toHaveBeenCalled();
  });

  it('registers a new user, opens a session and returns the auth payload', async () => {
    // Cobre o fluxo completo de cadastro: hash da senha, criacao do usuario, token e sessao persistida.
    authRepository.findUserByEmail.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue('hashed-password' as never);
    authRepository.createUser.mockResolvedValue(user);

    const result = await service.register({
      name: user.name,
      email: user.email,
      password: 'strong-password',
      confirmPassword: 'strong-password',
    });

    expect(bcryptHashMock).toHaveBeenCalledWith('strong-password', 10);
    expect(authRepository.createUser).toHaveBeenCalledWith({
      name: user.name,
      email: user.email,
      passwordHash: 'hashed-password',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      name: user.name,
      sid: 'session-1',
    });
    expect(authRepository.createSession).toHaveBeenCalledWith({
      id: 'session-1',
      userId: user.id,
      expiresAt: new Date(1_800_000_000 * 1000),
    });
    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe(user.email);
  });

  it('fails registration when the signed token cannot be decoded into a session expiration', async () => {
    // Evita salvar uma sessao quando o token gerado nao possui expiracao valida.
    authRepository.findUserByEmail.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue('hashed-password' as never);
    authRepository.createUser.mockResolvedValue(user);
    jwtService.decode.mockReturnValue(null);

    await expect(
      service.register({
        name: user.name,
        email: user.email,
        password: 'strong-password',
        confirmPassword: 'strong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(authRepository.createSession).not.toHaveBeenCalled();
  });

  it('rejects login when the email is unknown', async () => {
    // Cobre o caso em que o usuario nem existe, sem chegar na comparacao com bcrypt.
    authRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.signIn({ email: user.email, password: 'strong-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(bcryptCompareMock).not.toHaveBeenCalled();
  });

  it('rejects login when the password does not match the stored hash', async () => {
    // Garante erro de credenciais quando a senha informada nao bate com o hash salvo.
    authRepository.findUserByEmail.mockResolvedValue(user);
    bcryptCompareMock.mockResolvedValue(false as never);

    await expect(
      service.signIn({ email: user.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('creates a fresh session when login succeeds', async () => {
    // Garante que cada login bem-sucedido cria uma nova sessao revogavel.
    authRepository.findUserByEmail.mockResolvedValue(user);
    bcryptCompareMock.mockResolvedValue(true as never);

    const result = await service.signIn({
      email: user.email,
      password: 'strong-password',
    });

    expect(authRepository.createSession).toHaveBeenCalledTimes(1);
    expect(result.user.id).toBe(user.id);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('revokes the current session on logout', async () => {
    // Verifica que o logout revoga exatamente a sessao autenticada atual.
    authRepository.revokeSession.mockResolvedValue(undefined as never);

    const result = await service.signOut({
      id: user.id,
      email: user.email,
      name: user.name,
      sessionId: 'session-1',
    });

    expect(authRepository.revokeSession).toHaveBeenCalledWith(
      user.id,
      'session-1',
    );
    expect(result.message).toBe('Logged out successfully.');
  });

  it('returns the authenticated profile when the user still exists', async () => {
    // Garante que o GET /me busca o usuario no banco e nao depende so do payload do token.
    authRepository.findUserById.mockResolvedValue(user);

    const result = await service.getProfile({
      id: user.id,
      email: user.email,
      name: user.name,
      sessionId: 'session-1',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
    );
  });

  it('fails GET /me when the user was deleted after the token was issued', async () => {
    // Impede que a API retorne um perfil stale quando o usuario ja foi removido.
    authRepository.findUserById.mockResolvedValue(null);

    await expect(
      service.getProfile({
        id: user.id,
        email: user.email,
        name: user.name,
        sessionId: 'session-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
