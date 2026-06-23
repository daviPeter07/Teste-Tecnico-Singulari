import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

//https://docs.nestjs.com/recipes/prisma#set-up-prisma
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    super({ adapter });
  }
}
