export type Preference = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type UpdateMyPreferencesInput = {
  categoryIds: string[];
};
