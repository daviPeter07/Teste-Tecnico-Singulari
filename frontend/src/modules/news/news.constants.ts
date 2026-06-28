export const newsPeriodValues = ["day", "week", "month"] as const;

export type NewsPeriod = (typeof newsPeriodValues)[number];

export const DEFAULT_NEWS_PERIOD: NewsPeriod = "week";
export const NEWS_PAGE_LIMIT = 10;

export const newsPeriods = [
  { label: "Hoje", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
] as const satisfies ReadonlyArray<{ label: string; value: NewsPeriod }>;

export function normalizeNewsPeriod(
  value: string | string[] | undefined,
): NewsPeriod {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && newsPeriodValues.includes(rawValue as NewsPeriod)) {
    return rawValue as NewsPeriod;
  }

  return DEFAULT_NEWS_PERIOD;
}
