import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';

type CreateUserParams = {
  name: string;
  email: string;
  passwordHash: string;
};

type CreateSessionParams = {
  id: string;
  userId: string;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  createUser(params: CreateUserParams) {
    return this.prismaService.user.create({
      data: params,
    });
  }

  findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  createSession(params: CreateSessionParams) {
    return this.prismaService.userSession.create({
      data: params,
    });
  }

  findActiveSessionById(id: string) {
    return this.prismaService.userSession.findFirst({
      where: {
        id,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  revokeSession(userId: string, sessionId: string) {
    return this.prismaService.userSession.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
