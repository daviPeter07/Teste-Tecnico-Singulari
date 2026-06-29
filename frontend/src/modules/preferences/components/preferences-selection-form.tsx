"use client";

import type { Preference } from "@/modules/preferences/types/preferences.types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";

type PreferencesSelectionFormProps = {
  availablePreferences: Preference[];
  formAction: (payload: FormData) => void;
  hasPendingChanges: boolean;
  isPending: boolean;
  isReadOnly: boolean;
  onToggleCategory: (categoryId: string, checked: boolean) => void;
  selectedIds: string[];
};

export function PreferencesSelectionForm({
  availablePreferences,
  formAction,
  hasPendingChanges,
  isPending,
  isReadOnly,
  onToggleCategory,
  selectedIds,
}: PreferencesSelectionFormProps) {
  return (
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
                      onToggleCategory(preference.id, value === true)
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
          disabled={!hasPendingChanges || isPending || isReadOnly}
          type="submit"
        >
          {isPending ? "Salvando..." : "Salvar preferências"}
        </Button>
      </div>
    </form>
  );
}
