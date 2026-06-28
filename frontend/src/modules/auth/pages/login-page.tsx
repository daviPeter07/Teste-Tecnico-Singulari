import { LoginForm } from "@/modules/auth/components/login-form";
import { authService } from "@/modules/auth/services/auth.service";

export async function LoginPage() {
  await authService.redirectIfAuthenticated();

  return (
    <div className="space-y-6">
      <div className="space-y-2 px-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Acesso
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Entrar
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Informe seus dados para continuar.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
