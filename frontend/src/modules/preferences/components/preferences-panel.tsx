"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import type { AuthUser } from "@/modules/auth/types/auth.types";
import { usePreferencesForm } from "@/modules/preferences/hooks/use-preferences-form";
import type { Preference } from "@/modules/preferences/types/preferences.types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";

type PreferencesPanelProps = {
  user: AuthUser;
  availablePreferences: Preference[];
  initialPreferences: Preference[];
  loadErrorMessage?: string;
};

export function PreferencesPanel({
  user,
  availablePreferences,
  initialPreferences,
  loadErrorMessage,
}: PreferencesPanelProps) {
  const {
    formAction,
    hasPendingChanges,
    isPending,
    selectedIds,
    state,
    toggleCategory,
  } = usePreferencesForm(initialPreferences);

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
        <CardHeader>
          <CardTitle>Preferências de categorias</CardTitle>
          <CardDescription>
            Selecione os temas que você quer priorizar na sua experiência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loadErrorMessage ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>
                Não foi possível carregar suas preferências
              </AlertTitle>
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

          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>Não foi possível salvar</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          {state.status === "success" && state.message ? (
            <Alert>
              <CheckCircle2Icon className="size-4" />
              <AlertTitle>Alterações salvas</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          {!availablePreferences.length && !loadErrorMessage ? (
            <Empty className="border border-dashed border-border/80 bg-background/40">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircleIcon className="size-4" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma categoria disponível</EmptyTitle>
                <EmptyDescription>
                  O backend ainda não retornou categorias para selecionar.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <form action={formAction} className="space-y-5">
              <FieldSet>
                <FieldGroup>
                  {availablePreferences.map((preference) => {
                    const checked = selectedIds.includes(preference.id);

                    return (
                      <Field key={preference.id} orientation="horizontal">
                        <FieldLabel className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-background/85">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleCategory(preference.id, value === true)
                            }
                          />
                          <input
                            name="categoryIds"
                            type="hidden"
                            value={checked ? preference.id : ""}
                          />
                          <FieldContent>
                            <FieldTitle>{preference.name}</FieldTitle>
                            <FieldDescription>
                              {preference.description ??
                                `Conteúdo da categoria ${preference.slug}.`}
                            </FieldDescription>
                          </FieldContent>
                        </FieldLabel>
                      </Field>
                    );
                  })}
                </FieldGroup>
              </FieldSet>

              <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-border/70 bg-background/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>
                    {selectedIds.length} categoria
                    {selectedIds.length === 1 ? "" : "s"} selecionada
                    {selectedIds.length === 1 ? "" : "s"}.
                  </p>
                  <p>
                    {hasPendingChanges
                      ? "Você tem alterações pendentes para salvar."
                      : "Sua seleção atual já está sincronizada."}
                  </p>
                </div>

                <Button
                  className="sm:min-w-40"
                  disabled={
                    !hasPendingChanges || isPending || !!loadErrorMessage
                  }
                  type="submit"
                >
                  {isPending ? "Salvando..." : "Salvar preferências"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/82 shadow-lg shadow-black/10 dark:shadow-black/30">
        <CardHeader>
          <CardTitle>Sessão protegida</CardTitle>
          <CardDescription>
            Esta área continua validando a sessão no servidor antes da
            hidratação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Usuário autenticado</p>
              <p>
                <span className="font-medium text-foreground">{user.name}</span>{" "}
                ({user.email})
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3">
            As leituras e escritas desta página acontecem no servidor sem expor
            um proxy de API dentro do frontend.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
