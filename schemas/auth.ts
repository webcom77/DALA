import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Digite um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Digite um e-mail válido." }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
