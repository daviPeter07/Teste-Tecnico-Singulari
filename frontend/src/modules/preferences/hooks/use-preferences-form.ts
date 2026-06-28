"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  initialUpdatePreferencesState,
  updateMyPreferencesAction,
} from "@/modules/preferences/services/preferences.actions";
import type { Preference } from "@/modules/preferences/types/preferences.types";

function getPreferenceIds(preferences?: Preference[]) {
  return [...(preferences ?? [])].map((preference) => preference.id).sort();
}

function areEqualPreferenceIds(current: string[], next: string[]) {
  if (current.length !== next.length) {
    return false;
  }

  return current.every((id, index) => id === next[index]);
}

export function usePreferencesForm(initialPreferences: Preference[]) {
  const initialSavedIds = useMemo(
    () => getPreferenceIds(initialPreferences),
    [initialPreferences],
  );
  const [state, formAction, isPending] = useActionState(
    updateMyPreferencesAction,
    {
      ...initialUpdatePreferencesState,
      savedIds: initialSavedIds,
    },
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSavedIds);

  useEffect(() => {
    if (state.status === "success") {
      setSelectedIds(state.savedIds);
    }
  }, [state.savedIds, state.status]);

  const savedIds = state.savedIds;
  const sortedSelectedIds = useMemo(
    () => [...selectedIds].sort(),
    [selectedIds],
  );
  const hasPendingChanges = !areEqualPreferenceIds(sortedSelectedIds, savedIds);

  function toggleCategory(categoryId: string, checked: boolean) {
    setSelectedIds((currentIds) => {
      if (checked) {
        if (currentIds.includes(categoryId)) {
          return currentIds;
        }

        return [...currentIds, categoryId];
      }

      return currentIds.filter((id) => id !== categoryId);
    });
  }

  return {
    formAction,
    hasPendingChanges,
    isPending,
    selectedIds,
    state,
    toggleCategory,
  };
}
