import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PreferencesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany() {
    return this.prismaService.category.findMany({
      orderBy: {
        name: 'asc',
      }
    });
  }
}
