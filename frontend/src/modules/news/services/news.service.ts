import type {
  ListNewsParams,
  PaginatedNewsResponse,
} from "@/modules/news/types/news.types";
import {
  DEFAULT_NEWS_PERIOD,
  NEWS_PAGE_LIMIT,
  type NewsPeriod,
} from "@/modules/news/types/news.types";
import { apiClient } from "@/shared/lib/http/api-client";

type NormalizedListNewsParams = {
  page: number;
  limit: number;
  period: NewsPeriod;
  category?: string;
};

function normalizeListNewsParams(
  params: ListNewsParams = {},
): NormalizedListNewsParams {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? NEWS_PAGE_LIMIT,
    period: params.period ?? DEFAULT_NEWS_PERIOD,
    category: params.category,
  };
}

function buildListNewsPath(params: NormalizedListNewsParams) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    period: params.period,
  });

  if (params.category) {
    searchParams.set("category", params.category);
  }

  return `/news?${searchParams.toString()}`;
}

async function listNews(
  params: ListNewsParams = {},
): Promise<PaginatedNewsResponse> {
  const normalizedParams = normalizeListNewsParams(params);

  return apiClient.get<PaginatedNewsResponse>(
    buildListNewsPath(normalizedParams),
  );
}

export const newsService = {
  listNews,
};
