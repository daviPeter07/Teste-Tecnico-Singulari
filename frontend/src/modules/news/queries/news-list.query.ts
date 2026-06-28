import { queryOptions } from "@tanstack/react-query";
import { newsService } from "@/modules/news/services/news.service";
import {
  DEFAULT_NEWS_PERIOD,
  type ListNewsParams,
  NEWS_PAGE_LIMIT,
  type NewsPeriod,
  newsPeriodValues,
} from "@/modules/news/types/news.types";

function normalizeListNewsParams(params: ListNewsParams = {}) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? NEWS_PAGE_LIMIT,
    period: params.period ?? DEFAULT_NEWS_PERIOD,
    category: params.category,
  };
}

export function normalizeNewsPeriod(
  value: string | string[] | undefined,
): NewsPeriod {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && newsPeriodValues.includes(rawValue as NewsPeriod)) {
    return rawValue as NewsPeriod;
  }

  return DEFAULT_NEWS_PERIOD;
}

export function getNewsListQueryOptions(params: ListNewsParams = {}) {
  const normalizedParams = normalizeListNewsParams(params);

  return queryOptions({
    queryKey: ["news", "list", normalizedParams] as const,
    queryFn: () => newsService.listNews(normalizedParams),
  });
}
