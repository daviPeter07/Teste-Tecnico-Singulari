import { AlertCircleIcon } from "lucide-react";
import { NewsGrid } from "@/modules/news/components/news-grid";
import { NewsPagination } from "@/modules/news/components/news-pagination";
import type { PaginatedNewsResponse } from "@/modules/news/types/news.types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

type NewsListProps = {
  currentPage: number;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage?: string;
  response?: PaginatedNewsResponse;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

function NewsListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          className="rounded-2xl border border-border/70 bg-background p-5"
          key={`news-skeleton-${index + 1}`}
        >
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-4 h-6 w-5/6" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-10/12" />
          <Skeleton className="mt-8 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export function NewsList({
  currentPage,
  isLoading,
  isRefreshing,
  hasError,
  errorMessage,
  response,
  onPageChange,
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
          <p>{errorMessage ?? "Tente novamente em instantes."}</p>
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
        Nenhuma notícia foi encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isRefreshing ? (
        <p className="text-sm text-muted-foreground">Atualizando...</p>
      ) : null}

      <NewsGrid news={response.data} />

      <NewsPagination
        currentPage={currentPage}
        meta={response.meta}
        onPageChange={onPageChange}
      />
    </div>
  );
}
