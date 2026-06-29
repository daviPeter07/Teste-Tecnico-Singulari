"use client";

import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";

type PreferencesFeedbackProps = {
  isPending: boolean;
  loadErrorMessage?: string;
  message?: string;
  status: "idle" | "success" | "error";
};

export function PreferencesFeedback({
  isPending,
  loadErrorMessage,
  message,
  status,
}: PreferencesFeedbackProps) {
  return (
    <>
      {loadErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Não foi possível carregar suas preferências</AlertTitle>
          <AlertDescription>{loadErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isPending ? (
        <Alert>
          <Loader2Icon className="size-4 animate-spin" />
          <AlertTitle>Salvando preferências</AlertTitle>
          <AlertDescription>
            Estamos enviando sua seleção atual para o backend.
          </AlertDescription>
        </Alert>
      ) : null}

      {status === "error" && message ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {status === "success" && message ? (
        <Alert>
          <CheckCircle2Icon className="size-4" />
          <AlertTitle>Alterações salvas</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
