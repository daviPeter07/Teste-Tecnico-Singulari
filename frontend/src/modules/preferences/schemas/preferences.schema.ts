import { z } from "zod";

export const updateMyPreferencesSchema = z.object({
  categoryIds: z.array(z.string().trim().min(1)).default([]),
});
