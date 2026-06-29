"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/modules/auth/schemas/auth.schema";
import { registerAction } from "@/modules/auth/services/auth.actions";
import type { RegisterValues } from "@/modules/auth/types/auth.types";

export function useRegisterForm() {
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

  return {
    form,
    formError,
    isSubmitting,
    onSubmit,
  };
}
