import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../database/prisma.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository extends PrismaRepository {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findPreferences(userId: string) {
    const categories = await this.prismaService.userPreference.findMany({
      where: { userId },
      select: {
        category: true,
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    return categories.map(({ category }) => category);
  }

  async replacePreferences(userId: string, categoryIds: string[]) {
    return this.prismaService.$transaction(async (transaction) => {
      await transaction.userPreference.deleteMany({
        where: { userId },
      });

      if (categoryIds.length > 0) {
        await transaction.userPreference.createMany({
          data: categoryIds.map((categoryId) => ({ userId, categoryId })),
        });
      }

      return transaction.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
  }
}
