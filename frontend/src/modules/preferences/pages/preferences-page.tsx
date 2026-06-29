import { authService } from "@/modules/auth/services/auth.service";
import { PreferencesPanel } from "@/modules/preferences/components/preferences-panel";
import { preferencesService } from "@/modules/preferences/services/preferences.service";
import { ApiError } from "@/shared/lib/http/api-error";

export async function PreferencesPage() {
  const user = await authService.requireAuthenticatedUser();
  const token = await authService.getSessionToken();

  if (!token) {
    return null;
  }

  try {
    const [availablePreferences, initialPreferences] = await Promise.all([
      preferencesService.listAvailablePreferences(),
      preferencesService.listMyPreferences(token),
    ]);

    return (
      <PreferencesPanel
        availablePreferences={availablePreferences}
        initialPreferences={initialPreferences}
        user={user}
      />
    );
  } catch (error) {
    const loadErrorMessage =
      error instanceof ApiError
        ? error.message
        : "Não foi possível carregar suas preferências agora.";

    return (
      <PreferencesPanel
        availablePreferences={[]}
        initialPreferences={[]}
        loadErrorMessage={loadErrorMessage}
        user={user}
      />
    );
  }
}
