import { authService } from "@/modules/auth/services/auth.service";
import { PreferencesPanel } from "@/modules/preferences/components/preferences-panel";
import { preferencesServerService } from "@/modules/preferences/services/preferences.server";
import { ApiError } from "@/shared/lib/http/api-error";

export default async function PreferencesPage() {
  const user = await authService.requireAuthenticatedUser();
  const token = await authService.getSessionToken();

  if (!token) {
    return null;
  }

  try {
    const [availablePreferences, initialPreferences] = await Promise.all([
      preferencesServerService.listAvailablePreferences(token),
      preferencesServerService.listMyPreferences(token),
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
