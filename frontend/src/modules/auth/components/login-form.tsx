"use client";

import { Loader2Icon, LockKeyholeIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { loginAction } from "@/modules/auth/actions/auth.actions";
import { AUTH_REGISTER_PATH } from "@/modules/auth/auth.constants";
import {
  initialLoginActionState,
  type LoginActionState,
} from "@/modules/auth/types/auth.types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { CardContent, CardFooter } from "@/shared/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

const getFieldMessage = (
  state: LoginActionState,
  field: keyof typeof state.values,
) => state.fieldErrors?.[field]?.join(" ");

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="contents">
      <CardContent className="space-y-6">
        {state.message ? (
          <Alert variant="destructive">
            <LockKeyholeIcon className="size-4" />
            <AlertTitle>Não foi possível autenticar</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <FieldContent>
              <Input
                autoComplete="email"
                defaultValue={state.values.email ?? ""}
                id="email"
                name="email"
                placeholder="voce@empresa.com"
                type="email"
              />
              <FieldError>{getFieldMessage(state, "email")}</FieldError>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <FieldContent>
              <Input
                autoComplete="current-password"
                defaultValue={state.values.password ?? ""}
                id="password"
                name="password"
                placeholder="Sua senha"
                type="password"
              />
              <FieldError>{getFieldMessage(state, "password")}</FieldError>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button className="h-10 w-full" disabled={pending} type="submit">
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {pending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href={AUTH_REGISTER_PATH}
          >
            Criar cadastro
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
