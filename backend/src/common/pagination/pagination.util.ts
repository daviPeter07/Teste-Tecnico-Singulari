import { PaginationQueryDto } from './pagination-query.dto';
import { PaginatedResponse, PaginationMeta } from './pagination-response.type';

type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

type CreatePaginationMetaParams = {
  page: number;
  limit: number;
  total: number;
};

export function getPaginationParams(
  query: PaginationQueryDto,
): PaginationParams {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function createPaginationMeta({
  page,
  limit,
  total,
}: CreatePaginationMetaParams): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  meta: CreatePaginationMetaParams,
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(meta),
  };
}
