"use client";

import { FilterIcon, RefreshCcwIcon } from "lucide-react";
import type { NewsCategory, NewsPeriod } from "@/modules/news/types/news.types";
import { Button } from "@/shared/components/ui/button";

type NewsFiltersProps = {
  category?: string | null;
  categories: NewsCategory[];
  isRefreshing: boolean;
  onCategoryChange: (category?: string) => void | Promise<void>;
  onPeriodChange: (period: NewsPeriod) => void | Promise<void>;
  onRefresh: () => void;
  period: NewsPeriod;
  periods: ReadonlyArray<{ label: string; value: NewsPeriod }>;
};

export function NewsFilters({
  category,
  categories,
  isRefreshing,
  onCategoryChange,
  onPeriodChange,
  onRefresh,
  period,
  periods,
}: NewsFiltersProps) {
  return (
    <div className="space-y-4 border-b border-border/60 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <FilterIcon className="size-4" />
          Filtros
        </div>

        <Button
          disabled={isRefreshing}
          onClick={onRefresh}
          type="button"
          variant="outline"
        >
          <RefreshCcwIcon
            className={isRefreshing ? "size-4 animate-spin" : "size-4"}
          />
          Atualizar
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Período
        </p>
        <div className="flex flex-wrap gap-2">
          {periods.map((option) => (
            <Button
              key={option.value}
              onClick={() => void onPeriodChange(option.value)}
              type="button"
              variant={period === option.value ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Categoria
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void onCategoryChange(undefined)}
            type="button"
            variant={!category ? "default" : "outline"}
          >
            Todas
          </Button>

          {categories.map((option) => (
            <Button
              key={option.slug}
              onClick={() => void onCategoryChange(option.slug)}
              type="button"
              variant={category === option.slug ? "default" : "outline"}
            >
              {option.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
