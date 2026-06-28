import { FilterIcon, NewspaperIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const periods = [
  { label: "Hoje", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
] as const;

export default function HomePage() {
  return (
    <div className="grid w-full gap-8">
      <section className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Newsletter Inteligente
        </p>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-5xl">
            Base da home pronta para receber as notícias públicas da aplicação.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Esta estrutura já prepara a área de filtros, o espaço da listagem e
            a navegação principal. O próximo passo é conectar a consulta de
            notícias e renderizar os cards.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="size-4" />
              Filtros
            </CardTitle>
            <CardDescription>
              Estrutura preparada para os filtros por período exigidos no PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {periods.map((period) => (
              <Button
                className="w-full justify-start"
                key={period.value}
                type="button"
                variant="outline"
              >
                {period.label}
              </Button>
            ))}

            <Button
              className="w-full justify-start"
              type="button"
              variant="ghost"
            >
              <RefreshCcwIcon className="size-4" />
              Atualizar resultados
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NewspaperIcon className="size-4" />
              Área da listagem
            </CardTitle>
            <CardDescription>
              O espaço principal já está organizado para receber os cards de
              notícias com título, fonte, resumo e data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-dashed border-border/80 px-6 py-14 text-center text-sm text-muted-foreground">
              Nenhuma notícia foi conectada ainda nesta etapa. Esta seção é a
              base visual da home pública.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
