import { RegisterForm } from "@/modules/auth/components/register-form";
import { authService } from "@/modules/auth/services/auth.service";

export async function RegisterPage() {
  await authService.redirectIfAuthenticated();

  return (
    <div className="space-y-6">
      <div className="space-y-2 px-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Cadastro
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Criar conta
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Preencha os dados para acessar a aplicação.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
