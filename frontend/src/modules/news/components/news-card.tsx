import {
  CalendarDaysIcon,
  ExternalLinkIcon,
  NewspaperIcon,
} from "lucide-react";
import type { NewsItem } from "@/modules/news/types/news.types";
import { Badge } from "@/shared/components/ui/badge";

const publishedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatPublishedAt(value: string) {
  const publishedAt = new Date(value);

  if (Number.isNaN(publishedAt.getTime())) {
    return "Data indisponível";
  }

  return publishedAtFormatter.format(publishedAt);
}

export function NewsCard({ news }: { news: NewsItem }) {
  const title = news.url ? (
    <a
      className="inline-flex items-start gap-2 underline-offset-4 hover:underline"
      href={news.url}
      rel="noreferrer"
      target="_blank"
    >
      <span>{news.title}</span>
      <ExternalLinkIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    </a>
  ) : (
    news.title
  );

  return (
    <article className="rounded-2xl border border-border/70 bg-background/65 p-5 shadow-sm shadow-black/5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{news.category.name}</Badge>
        <span className="inline-flex items-center gap-1.5">
          <NewspaperIcon className="size-3.5" />
          {news.sourceName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDaysIcon className="size-3.5" />
          {formatPublishedAt(news.publishedAt)}
        </span>
      </div>

      <h3 className="mt-4 text-lg leading-snug font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {news.summary}
      </p>
    </article>
  );
}
