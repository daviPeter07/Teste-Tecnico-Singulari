"use server";

import { revalidatePath } from "next/cache";
import { authService } from "@/modules/auth/services/auth.service";
import { updateMyPreferencesSchema } from "@/modules/preferences/schemas/preferences.schema";
import { preferencesService } from "@/modules/preferences/services/preferences.service";
import type { Preference } from "@/modules/preferences/types/preferences.types";
import { ApiError } from "@/shared/lib/http/api-error";

export type UpdatePreferencesActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  savedIds: string[];
};

const INITIAL_STATE: UpdatePreferencesActionState = {
  status: "idle",
  savedIds: [],
};

function getPreferenceIds(preferences: Preference[]) {
  return [...preferences].map((preference) => preference.id).sort();
}

function getActionErrorMessage(error: ApiError) {
  if (error.errorCode === "INVALID_USER_PREFERENCES") {
    return "Uma ou mais categorias selecionadas não são mais válidas.";
  }

  return error.message || "Não foi possível salvar suas preferências agora.";
}

export async function updateMyPreferencesAction(
  _previousState: UpdatePreferencesActionState,
  formData: FormData,
): Promise<UpdatePreferencesActionState> {
  const token = await authService.getSessionToken();

  if (!token) {
    return {
      status: "error",
      message: "Sua sessão expirou. Faça login novamente.",
      savedIds: [],
    };
  }

  const parsed = updateMyPreferencesSchema.safeParse({
    categoryIds: formData
      .getAll("categoryIds")
      .filter((value): value is string => typeof value === "string")
      .filter(Boolean),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Não foi possível salvar suas preferências agora.",
      savedIds: [],
    };
  }

  try {
    const preferences = await preferencesService.updateMyPreferences(
      token,
      parsed.data,
    );

    revalidatePath("/");
    revalidatePath("/preferences");

    return {
      status: "success",
      message: "Preferências salvas com sucesso.",
      savedIds: getPreferenceIds(preferences),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        await authService.clearSession();
      }

      return {
        status: "error",
        message: getActionErrorMessage(error),
        savedIds: [],
      };
    }

    return {
      status: "error",
      message: "Não foi possível salvar suas preferências agora.",
      savedIds: [],
    };
  }
}

