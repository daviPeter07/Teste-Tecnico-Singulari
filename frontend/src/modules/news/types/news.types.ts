export const newsPeriodValues = ["day", "week", "month"] as const;

export type NewsPeriod = (typeof newsPeriodValues)[number];

export const DEFAULT_NEWS_PERIOD: NewsPeriod = "week";
export const NEWS_PAGE_LIMIT = 10;

export const newsPeriods = [
  { label: "Hoje", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
] as const satisfies ReadonlyArray<{ label: string; value: NewsPeriod }>;

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
