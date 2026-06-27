import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user.type';
import { EmailAlreadyInUseException } from '../../common/exceptions/email-already-in-use.exception';
import { InvalidCredentialsException } from '../../common/exceptions/invalid-credentials.exception';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthRepository } from './auth.repository';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(body: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findUserByEmail(body.email);

    if (existingUser) {
      throw new EmailAlreadyInUseException(body.email);
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.authRepository.createUser({
      name: body.name,
      email: body.email,
      passwordHash,
    });

    return this.createAuthenticatedResponse(user);
  }

  async signIn({ email, password }: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return this.createAuthenticatedResponse(user);
  }

  async signOut(user: AuthenticatedUser): Promise<LogoutResponseDto> {
    await this.authRepository.revokeSession(user.id, user.sessionId);

    return new LogoutResponseDto('Logged out successfully.');
  }

  async getProfile(user: AuthenticatedUser): Promise<UserResponseDto> {
    const found = await this.authRepository.findUserById(user.id);

    if (!found) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(found);
  }

  private async createAuthenticatedResponse(user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResponseDto> {
    const sessionId = randomUUID();
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      sid: sessionId,
    });
    const decodedToken = this.jwtService.decode(accessToken);

    if (
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !('exp' in decodedToken)
    ) {
      throw new InvalidCredentialsException();
    }

    await this.authRepository.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date((decodedToken.exp as number) * 1000),
    });

    return new AuthResponseDto({
      accessToken,
      user: UserResponseDto.fromEntity(user),
    });
  }
}
