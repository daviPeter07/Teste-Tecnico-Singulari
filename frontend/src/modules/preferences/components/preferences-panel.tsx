"use client";

import type { AuthUser } from "@/modules/auth/types/auth.types";
import { PreferencesFeedback } from "@/modules/preferences/components/preferences-feedback";
import { PreferencesSelectionForm } from "@/modules/preferences/components/preferences-selection-form";
import { PreferencesSessionCard } from "@/modules/preferences/components/preferences-session-card";
import { usePreferencesForm } from "@/modules/preferences/hooks/use-preferences-form";
import type { Preference } from "@/modules/preferences/types/preferences.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

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
          <PreferencesFeedback
            isPending={isPending}
            loadErrorMessage={loadErrorMessage}
            message={state.message}
            status={state.status}
          />

          {!availablePreferences.length && !loadErrorMessage ? (
            <Empty className="border border-dashed border-border/80 bg-background/40">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <span className="size-4 rounded-full bg-muted-foreground/30" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma categoria disponível</EmptyTitle>
                <EmptyDescription>
                  Nenhuma categoria disponível no momento. Tente novamente mais
                  tarde.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <PreferencesSelectionForm
              availablePreferences={availablePreferences}
              formAction={formAction}
              hasPendingChanges={hasPendingChanges}
              isPending={isPending}
              isReadOnly={Boolean(loadErrorMessage)}
              onToggleCategory={toggleCategory}
              selectedIds={selectedIds}
            />
          )}
        </CardContent>
      </Card>

      <PreferencesSessionCard user={user} />
    </div>
  );
}
