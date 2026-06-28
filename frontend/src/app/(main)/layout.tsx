import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_COOKIE_NAME } from "@/modules/auth/auth.constants";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Button } from "@/shared/components/ui/button";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/82 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link
              className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground"
              href={hasSession ? "/preferences" : "/"}
            >
              Newsletter Inteligente
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">Notícias</Link>
            </Button>

            {hasSession ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/preferences">Preferências</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Criar conta</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
