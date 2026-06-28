"use client";

import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { useRegisterForm } from "@/modules/auth/hooks/use-register-form";
import { AUTH_LOGIN_PATH } from "@/modules/auth/types/auth.constants";
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
  const { form, formError, isSubmitting, onSubmit } = useRegisterForm();

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
