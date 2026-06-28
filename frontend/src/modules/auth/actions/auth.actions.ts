"use server";

import { redirect } from "next/navigation";
import {
  AUTH_LOGIN_PATH,
  AUTH_REDIRECT_PATH,
} from "@/modules/auth/auth.constants";
import {
  loginSchema,
  registerSchema,
} from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import type {
  LoginActionState,
  LoginValues,
  RegisterActionState,
  RegisterValues,
} from "@/modules/auth/types/auth.types";
import { ApiError } from "@/shared/lib/http/api-error";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
  EMAIL_ALREADY_IN_USE: "Este e-mail já está em uso.",
};

const getApiErrorMessage = (error: ApiError, fallback: string): string => {
  if (error.errorCode && error.errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error.errorCode];
  }

  return error.message || fallback;
};

const normalizeFieldErrors = <TValues extends Record<string, string>>(
  values: Partial<TValues>,
  fieldErrors: Partial<Record<keyof TValues & string, string[]>>,
  message: string,
) => ({
  status: "error" as const,
  message,
  values,
  fieldErrors,
});

export async function loginAction(
  values: LoginValues,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return normalizeFieldErrors(
      values,
      parsed.error.flatten().fieldErrors,
      "Confira os dados e tente novamente.",
    );
  }

  try {
    const response = await authService.login(parsed.data);
    await authService.persistSession(response.accessToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível entrar agora. Tente novamente em instantes.",
        ),
        values,
      };
    }

    return {
      status: "error",
      message: "Não foi possível entrar agora. Tente novamente em instantes.",
      values,
    };
  }

  redirect(AUTH_REDIRECT_PATH);
}

export async function registerAction(
  values: RegisterValues,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return normalizeFieldErrors(
      values,
      parsed.error.flatten().fieldErrors,
      "Confira os dados e tente novamente.",
    );
  }

  try {
    const response = await authService.register(parsed.data);
    await authService.persistSession(response.accessToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível criar a conta agora. Tente novamente em instantes.",
        ),
        values,
      };
    }

    return {
      status: "error",
      message:
        "Não foi possível criar a conta agora. Tente novamente em instantes.",
      values,
    };
  }

  redirect(AUTH_REDIRECT_PATH);
}

export async function logoutAction() {
  const token = await authService.getSessionToken();

  try {
    await authService.logout(token);
  } finally {
    await authService.clearSession();
  }

  redirect(AUTH_LOGIN_PATH);
}
