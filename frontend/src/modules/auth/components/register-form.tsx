"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerAction } from "@/modules/auth/actions/auth.actions";
import { AUTH_LOGIN_PATH } from "@/modules/auth/auth.constants";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { registerSchema } from "@/modules/auth/schemas/auth.schema";
import type { RegisterValues } from "@/modules/auth/types/auth.types";
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

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    form.clearErrors();

    const result = await registerAction(values);

    const fieldNames = [
      "name",
      "email",
      "password",
      "confirmPassword",
    ] as const;

    if (result.fieldErrors) {
      for (const fieldName of fieldNames) {
        const message = result.fieldErrors[fieldName]?.[0];

        if (message) {
          form.setError(fieldName, {
            type: "server",
            message,
          });
        }
      }
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
              <AlertTitle>Não foi possível concluir o cadastro</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Seu nome"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      placeholder="voce@empresa.com"
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
                      autoComplete="new-password"
                      placeholder="Crie uma senha segura"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Repita a senha"
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

            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              className="font-medium text-foreground underline underline-offset-4"
              href={AUTH_LOGIN_PATH}
            >
              Fazer login
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
