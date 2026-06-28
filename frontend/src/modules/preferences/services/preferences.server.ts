import "server-only";

import type {
  Preference,
  UpdateMyPreferencesInput,
} from "@/modules/preferences/types/preferences.types";
import { apiClient } from "@/shared/lib/http/api-client";

export const preferencesServerService = {
  listAvailablePreferences(token: string) {
    return apiClient.get<Preference[]>("/preferences", { token });
  },

  listMyPreferences(token: string) {
    return apiClient.get<Preference[]>("/users/me/preferences", { token });
  },

  updateMyPreferences(token: string, body: UpdateMyPreferencesInput) {
    return apiClient.put<Preference[]>("/users/me/preferences", {
      body,
      token,
    });
  },
};
