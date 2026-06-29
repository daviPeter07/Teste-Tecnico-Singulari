import { NewsCard } from "@/modules/news/components/news-card";
import type { NewsItem } from "@/modules/news/types/news.types";

export function NewsGrid({ news }: { news: NewsItem[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}
