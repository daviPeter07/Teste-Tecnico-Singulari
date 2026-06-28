import type { z } from "zod";
import type {
  loginSchema,
  registerSchema,
} from "@/modules/auth/schemas/auth.schema";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

type FormState<TValues extends Record<string, string>> = {
  status: "idle" | "error";
  message?: string;
  values: Partial<TValues>;
  fieldErrors?: Partial<Record<keyof TValues & string, string[]>>;
};

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export type LoginActionState = FormState<LoginValues>;
export type RegisterActionState = FormState<RegisterValues>;
