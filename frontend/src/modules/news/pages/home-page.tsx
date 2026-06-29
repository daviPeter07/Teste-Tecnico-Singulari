import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { NewsFeed } from "@/modules/news/components/news-feed";
import {
  getNewsListQueryOptions,
  normalizeNewsCategory,
  normalizeNewsPage,
  normalizeNewsPeriod,
} from "@/modules/news/queries/news-list.query";
import { NEWS_PAGE_LIMIT } from "@/modules/news/types/news.types";
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

  await queryClient.prefetchQuery(
    getNewsListQueryOptions({
      category,
      limit: NEWS_PAGE_LIMIT,
      page,
      period,
    }),
  );

  return (
    <div className="grid w-full gap-8">
      <section className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Newsletter Inteligente
        </p>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-5xl">
            As principais novidades de tecnologia, em um só lugar.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Acompanhe notícias selecionadas por período e encontre rapidamente o
            que está movimentando o mercado.
          </p>
        </div>
      </section>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewsFeed />
      </HydrationBoundary>
    </div>
  );
}
