"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/modules/auth/schemas/auth.schema";
import { loginAction } from "@/modules/auth/services/auth.actions";
import type { LoginValues } from "@/modules/auth/types/auth.types";

export function useLoginForm() {
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

  return {
    form,
    formError,
    isSubmitting,
    onSubmit,
  };
}
