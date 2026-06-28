import type { ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
      <Card className="grid w-full max-w-6xl overflow-hidden border border-border/70 bg-card/88 shadow-2xl shadow-black/20 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between gap-10 border-b border-border/70 px-6 py-8 sm:px-8 lg:border-r lg:border-b-0 lg:px-10 lg:py-10">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Newsletter Inteligente
            </p>
            <h1 className="max-w-lg text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-5xl">
              Notícias organizadas para você acompanhar o que importa.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Entre para acessar sua conta, acompanhar a curadoria e preparar a
              sua experiência dentro da aplicação.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-background/72 px-5 py-4">
              Um espaço simples para entrar, criar conta e seguir para as áreas
              autenticadas da plataforma.
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/72 px-5 py-4">
              A base de autenticação já está pronta para conectar preferências,
              notícias e novas jornadas da aplicação.
            </div>
          </div>
        </section>

        <section className="flex items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="w-full">{children}</div>
        </section>
      </Card>
    </div>
  );
}
