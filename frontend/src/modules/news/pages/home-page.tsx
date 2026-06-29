import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { NewsFeed } from "@/modules/news/components/news-feed";
import {
  getNewsListQueryOptions,
  normalizeNewsCategory,
  normalizeNewsPage,
  normalizeNewsPeriod,
} from "@/modules/news/queries/news-list.query";
import { NEWS_PAGE_LIMIT } from "@/modules/news/types/news.types";
import { preferencesService } from "@/modules/preferences/services/preferences.service";
import { createQueryClient } from "@/shared/lib/react-query/query-client";

type HomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
    period?: string | string[];
  }>;
};

export async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const category = normalizeNewsCategory(resolvedSearchParams.category);
  const page = normalizeNewsPage(resolvedSearchParams.page);
  const period = normalizeNewsPeriod(resolvedSearchParams.period);
  const queryClient = createQueryClient();

  const [categories] = await Promise.all([
    preferencesService.listAvailablePreferences().catch(() => []),
    queryClient.prefetchQuery(
      getNewsListQueryOptions({
        category,
        limit: NEWS_PAGE_LIMIT,
        page,
        period,
      }),
    ),
  ]);

  return (
    <div className="grid w-full gap-8">
      <section className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Newsletter Inteligente
        </p>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-5xl">
            Navegue por notícias de tecnologia atualizadas e filtradas por
            período.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Acompanhe a curadoria de mercado e encontre rapidamente o que
            importa.
          </p>
        </div>
      </section>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewsFeed initialCategories={categories} />
      </HydrationBoundary>
    </div>
  );
}
