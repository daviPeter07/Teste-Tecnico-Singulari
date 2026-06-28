"use client";

import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { useLoginForm } from "@/modules/auth/hooks/use-login-form";
import { AUTH_REGISTER_PATH } from "@/modules/auth/types/auth.constants";
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
  const { form, formError, isSubmitting, onSubmit } = useLoginForm();

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
