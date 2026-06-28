"use client";

import { FilterIcon, NewspaperIcon, RefreshCcwIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { NewsList } from "@/modules/news/components/news-list";
import {
  newsPeriodParser,
  useNewsListQuery,
} from "@/modules/news/hooks/use-news-list-query";
import { NEWS_PAGE_LIMIT, newsPeriods } from "@/modules/news/types/news.types";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ApiError } from "@/shared/lib/http/api-error";

export function NewsFeed() {
  const [period, setPeriod] = useQueryState("period", newsPeriodParser);
  const newsQuery = useNewsListQuery({
    page: 1,
    limit: NEWS_PAGE_LIMIT,
    period,
  });

  const errorMessage =
    newsQuery.error instanceof ApiError ? newsQuery.error.message : undefined;

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="size-4" />
            Filtros
          </CardTitle>
          <CardDescription>
            Escolha o período para ver as notícias mais recentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {newsPeriods.map((option) => (
            <Button
              className="w-full justify-start"
              key={option.value}
              onClick={() => void setPeriod(option.value)}
              type="button"
              variant={period === option.value ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}

          <Button
            className="w-full justify-start"
            disabled={newsQuery.isFetching}
            onClick={() => void newsQuery.refetch()}
            type="button"
            variant="ghost"
          >
            <RefreshCcwIcon
              className={
                newsQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
            />
            Atualizar resultados
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NewspaperIcon className="size-4" />
            Notícias públicas
          </CardTitle>
          <CardDescription>
            Confira uma seleção de notícias para acompanhar o que importa agora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsList
            errorMessage={errorMessage}
            hasError={newsQuery.isError}
            isLoading={newsQuery.isPending}
            isRefreshing={newsQuery.isFetching && !newsQuery.isPending}
            onRetry={() => void newsQuery.refetch()}
            response={newsQuery.data}
          />
        </CardContent>
      </Card>
    </section>
  );
}
