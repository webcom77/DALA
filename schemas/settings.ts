import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z
    .string()
    .min(2, { message: "O nome da loja deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome da loja deve ter no máximo 100 caracteres." }),
  responsibleName: z
    .string()
    .min(2, { message: "O nome do responsável deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome do responsável deve ter no máximo 100 caracteres." }),
  currency: z
    .string()
    .min(1, { message: "A moeda é obrigatória." }),
  language: z
    .string()
    .min(1, { message: "O idioma é obrigatório." }),
  theme: z.enum(["light", "dark", "system"], {
    errorMap: () => ({ message: "Selecione um tema válido." }),
  }),
});

export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;
