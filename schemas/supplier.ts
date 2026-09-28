import { z } from "zod";

export const supplierSchema = z.object({
  trade_name: z
    .string()
    .min(2, { message: "O nome fantasia deve ter no mínimo 2 caracteres." })
    .max(120, { message: "Máximo de 120 caracteres." }),
  corporate_name: z
    .string()
    .min(2, { message: "A razão social é obrigatória." })
    .max(150, { message: "Máximo de 150 caracteres." }),
  cnpj: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "E-mail inválido." }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  contact_person: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
