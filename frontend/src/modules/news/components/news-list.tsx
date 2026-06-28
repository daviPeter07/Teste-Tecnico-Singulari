import { AlertCircleIcon } from "lucide-react";
import { NewsCard } from "@/modules/news/components/news-card";
import type { PaginatedNewsResponse } from "@/modules/news/types/news.types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

type NewsListProps = {
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage?: string;
  response?: PaginatedNewsResponse;
  onRetry: () => void;
};

function NewsListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="rounded-2xl border border-border/70 bg-background/65 p-5"
          key={`news-skeleton-${index + 1}`}
        >
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-full" />
          </div>

          <Skeleton className="mt-4 h-6 w-4/5" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function NewsList({
  isLoading,
  isRefreshing,
  hasError,
  errorMessage,
  response,
  onRetry,
}: NewsListProps) {
  if (isLoading && !response) {
    return <NewsListSkeleton />;
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Não foi possível carregar as notícias</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            {errorMessage ??
              "Tente novamente em instantes para buscar a lista pública."}
          </p>
          <Button
            className="w-fit"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!response || response.data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 px-6 py-14 text-center text-sm text-muted-foreground">
        Nenhuma notícia pública foi encontrada para o período selecionado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          {response.meta.total} notícia{response.meta.total === 1 ? "" : "s"}{" "}
          encontrada
          {response.meta.total === 1 ? "" : "s"}
        </span>
        {isRefreshing ? <span>Atualizando...</span> : null}
      </div>

      {response.data.map((news) => (
        <NewsCard key={news.id} news={news} />
      ))}
    </div>
  );
}
