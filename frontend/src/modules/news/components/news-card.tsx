import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  NewspaperIcon,
} from "lucide-react";
import type { NewsItem } from "@/modules/news/types/news.types";

const publishedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
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
      className="group inline-flex items-start gap-2 hover:underline"
      href={news.url}
      rel="noreferrer"
      target="_blank"
    >
      <span>{news.title}</span>
      <ArrowUpRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
    </a>
  ) : (
    news.title
  );

  return (
    <article className="flex h-full min-h-72 flex-col rounded-2xl border border-border/70 bg-background p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{news.category.name}</span>
        <span className="inline-flex items-center gap-1.5">
          <NewspaperIcon className="size-3.5" />
          {news.sourceName}
        </span>
      </div>

      <h3 className="mt-4 text-lg leading-snug font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <p className="mt-3 line-clamp-5 text-sm leading-7 text-muted-foreground">
        {news.summary}
      </p>

      <div className="mt-auto pt-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDaysIcon className="size-3.5" />
          {formatPublishedAt(news.publishedAt)}
        </span>
      </div>
    </article>
  );
}
