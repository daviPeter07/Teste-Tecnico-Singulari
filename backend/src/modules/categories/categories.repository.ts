import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prismaService: PrismaService) { }

  //get all ordenado por nome
  async findMany() {
    return this.prismaService.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }
}