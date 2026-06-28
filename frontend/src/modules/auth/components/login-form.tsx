"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/modules/auth/actions/auth.actions";
import { AUTH_REGISTER_PATH } from "@/modules/auth/auth.constants";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { loginSchema } from "@/modules/auth/schemas/auth.schema";
import type { LoginValues } from "@/modules/auth/types/auth.types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { CardContent } from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    form.clearErrors();

    const result = await loginAction(values);

    if (result.fieldErrors?.email?.[0]) {
      form.setError("email", {
        type: "server",
        message: result.fieldErrors.email[0],
      });
    }

    if (result.fieldErrors?.password?.[0]) {
      form.setError("password", {
        type: "server",
        message: result.fieldErrors.password[0],
      });
    }

    if (result.status === "error" && result.message && !result.fieldErrors) {
      setFormError(result.message);
    }
  });

  return (
    <Form {...form}>
      <form className="contents" noValidate onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>Falha na autenticação</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>

                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="voce@empresa.com"
                      spellCheck={false}
                      type="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>

                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <div className="flex flex-col items-stretch gap-4 px-(--card-spacing) pt-2 pb-(--card-spacing)">
          <Button className="h-10 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting && (
              <Loader2Icon aria-hidden="true" className="animate-spin" />
            )}

            {isSubmitting ? "Entrando..." : "Entrar"}
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
        </div>
      </form>
    </Form>
  );
}
