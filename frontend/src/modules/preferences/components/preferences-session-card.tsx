import { ShieldCheckIcon } from "lucide-react";
import type { AuthUser } from "@/modules/auth/types/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function PreferencesSessionCard({ user }: { user: AuthUser }) {
  return (
    <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
      <CardHeader>
        <CardTitle>Sessão protegida</CardTitle>
        <CardDescription>
          Esta área continua validando a sessão no servidor antes da hidratação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
          <div>
            <p className="font-medium text-foreground">Usuário autenticado</p>
            <p>
              <span className="font-medium text-foreground">{user.name}</span> (
              {user.email})
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3">
          As leituras e escritas desta página acontecem no servidor sem expor um
          proxy de API dentro do frontend.
        </div>
      </CardContent>
    </Card>
  );
}
