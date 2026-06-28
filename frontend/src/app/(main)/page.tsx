import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { NewsFeed } from "@/modules/news/components/news-feed";
import {
  NEWS_PAGE_LIMIT,
  normalizeNewsPeriod,
} from "@/modules/news/news.constants";
import { getNewsListQueryOptions } from "@/modules/news/services/news.service";
import { createQueryClient } from "@/shared/lib/react-query/query-client";

type HomePageProps = {
  searchParams: Promise<{
    period?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const period = normalizeNewsPeriod(resolvedSearchParams.period);
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery(
    getNewsListQueryOptions({
      page: 1,
      limit: NEWS_PAGE_LIMIT,
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
            Notícias públicas conectadas com SSR e atualização client-side.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            A home agora consome o endpoint público de notícias, hidrata os
            dados no servidor e mantém a troca de período sincronizada pela URL.
          </p>
        </div>
      </section>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewsFeed />
      </HydrationBoundary>
    </div>
  );
}
