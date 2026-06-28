import type { NewsPeriod } from "@/modules/news/news.constants";

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
};

export type NewsItem = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl?: string | null;
  url?: string | null;
  summary: string;
  sentiment?: string | null;
  entities?: string[] | null;
  publishedAt: string;
  category: NewsCategory;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedNewsResponse = {
  data: NewsItem[];
  meta: PaginationMeta;
};

export type ListNewsParams = {
  page?: number;
  limit?: number;
  period?: NewsPeriod;
  category?: string;
};
