"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerAction } from "@/modules/auth/actions/auth.actions";
import { AUTH_LOGIN_PATH } from "@/modules/auth/auth.constants";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { registerSchema } from "@/modules/auth/schemas/auth.schema";
import {
  initialRegisterActionState,
  type RegisterValues,
} from "@/modules/auth/types/auth.types";
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
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialRegisterActionState,
  );
  const [, startTransition] = useTransition();
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

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    form.reset({
      name: state.values.name ?? "",
      email: state.values.email ?? "",
      password: state.values.password ?? "",
      confirmPassword: state.values.confirmPassword ?? "",
    });

    form.clearErrors();

    if (state.fieldErrors) {
      for (const [fieldName, messages] of Object.entries(state.fieldErrors)) {
        const message = messages?.[0];

        if (message) {
          form.setError(fieldName as keyof RegisterValues, {
            type: "server",
            message,
          });
        }
      }
    }
  }, [form, state.fieldErrors, state.values]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();

    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Form {...form}>
      <form className="contents" onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {state.message ? (
            <Alert variant="destructive">
              <SparklesIcon className="size-4" />
              <AlertTitle>Não foi possível concluir o cadastro</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
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
          <Button className="h-10 w-full" disabled={pending} type="submit">
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            {pending ? "Criando conta..." : "Criar conta"}
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
