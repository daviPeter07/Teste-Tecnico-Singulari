import { z } from "zod";

const emailSchema = z.string().trim().email("Informe um e-mail valido");
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais",
  });
