import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome não pode exceder 100 caracteres." }),
  email: z
    .string()
    .email({ message: "Digite um e-mail válido." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(8, { message: "Telefone ou WhatsApp inválido." })
    .optional()
    .or(z.literal("")),
  cpf_cnpj: z
    .string()
    .optional()
    .or(z.literal("")),
  birth_date: z
    .string()
    .optional()
    .or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  credit_limit: z.coerce.number().optional().default(0),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
