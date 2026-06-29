"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import { getNewsListQueryOptions } from "@/modules/news/queries/news-list.query";
import {
  DEFAULT_NEWS_PERIOD,
  type ListNewsParams,
  newsPeriodValues,
} from "@/modules/news/types/news.types";

export const newsPeriodParser = parseAsStringLiteral(newsPeriodValues)
  .withDefault(DEFAULT_NEWS_PERIOD)
  .withOptions({ history: "replace" });

export const newsPageParser = parseAsInteger
  .withDefault(1)
  .withOptions({ history: "push" });

export const newsCategoryParser = parseAsString.withOptions({
  history: "push",
});

export function useNewsListQuery(params: ListNewsParams = {}) {
  return useQuery(getNewsListQueryOptions(params));
}
