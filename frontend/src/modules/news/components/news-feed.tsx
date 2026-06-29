"use client";

import { useQueryState } from "nuqs";
import { NewsFilters } from "@/modules/news/components/news-filters";
import { NewsList } from "@/modules/news/components/news-list";
import {
  newsCategoryParser,
  newsPageParser,
  newsPeriodParser,
  useNewsListQuery,
} from "@/modules/news/hooks/use-news-list-query";
import {
  NEWS_PAGE_LIMIT,
  type NewsCategory,
  newsPeriods,
} from "@/modules/news/types/news.types";
import { ApiError } from "@/shared/lib/http/api-error";

function getCategoryOptions(categories: NewsCategory[]) {
  return categories.slice().sort((left, right) => {
    if (left.name < right.name) return -1;
    if (left.name > right.name) return 1;
    return 0;
  });
}

export function NewsFeed({
  initialCategories,
}: {
  initialCategories: NewsCategory[];
}) {
  const [period, setPeriod] = useQueryState("period", newsPeriodParser);
  const [page, setPage] = useQueryState("page", newsPageParser);
  const [category, setCategory] = useQueryState("category", newsCategoryParser);
  const safePage = page > 0 ? page : 1;

  const newsQuery = useNewsListQuery({
    category: category ?? undefined,
    page: safePage,
    limit: NEWS_PAGE_LIMIT,
    period,
  });

  const categories = getCategoryOptions(initialCategories);

  const errorMessage =
    newsQuery.error instanceof ApiError ? newsQuery.error.message : undefined;

  async function handlePeriodChange(
    nextPeriod: (typeof newsPeriods)[number]["value"],
  ) {
    await setPage(1);
    await setPeriod(nextPeriod);
  }

  async function handleCategoryChange(nextCategory?: string) {
    await setPage(1);
    await setCategory(nextCategory ?? null);
  }

  return (
    <section className="space-y-8">
      <NewsFilters
        categories={categories}
        category={category}
        isRefreshing={newsQuery.isFetching}
        onCategoryChange={handleCategoryChange}
        onPeriodChange={handlePeriodChange}
        onRefresh={() => void newsQuery.refetch()}
        period={period}
        periods={newsPeriods}
      />

      <div id="news-grid">
        <NewsList
          currentPage={safePage}
          errorMessage={errorMessage}
          hasError={newsQuery.isError}
          isLoading={newsQuery.isPending}
          isRefreshing={newsQuery.isFetching && !newsQuery.isPending}
          onPageChange={(nextPage) => void setPage(nextPage)}
          onRetry={() => void newsQuery.refetch()}
          response={newsQuery.data}
        />
      </div>
    </section>
  );
}
