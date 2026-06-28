import { ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { authService } from "@/modules/auth/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function PreferencesPage() {
  const user = await authService.requireAuthenticatedUser();

  return (
    <div className="grid w-full gap-6">
      <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
        <CardHeader>
          <CardTitle>Área protegida pronta</CardTitle>
          <CardDescription>
            Esta página valida a sessão no servidor consultando o backend antes
            de renderizar qualquer conteúdo sensível.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Sessão validada</p>
              <p>
                Usuário autenticado:{" "}
                <span className="font-medium text-foreground">{user.name}</span>{" "}
                ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <SparklesIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Próximo passo</p>
              <p>
                O próximo PR pode usar esta área protegida para listar e editar
                preferências de categorias consumindo os contratos já existentes
                do backend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
