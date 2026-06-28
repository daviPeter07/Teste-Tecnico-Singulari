"use client";

import { useQuery } from "@tanstack/react-query";
import { getNewsListQueryOptions } from "@/modules/news/services/news.service";
import type { ListNewsParams } from "@/modules/news/types/news.types";

export function useNewsQuery(params: ListNewsParams = {}) {
  return useQuery(getNewsListQueryOptions(params));
}
