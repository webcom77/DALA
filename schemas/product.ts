import { z } from "zod";

/**
 * Gera um código de referência único e profissional para o produto (ex: REF-10482 ou DAL-10482)
 */
export function generateProductReference(prefix = "REF"): string {
  const code = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${code}`;
}

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, { message: "O tamanho é obrigatório." }),
  color: z.string().min(1, { message: "A cor é obrigatória." }),
  sku_variant: z.string().min(2, { message: "O SKU da variação é obrigatório." }),
  barcode: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome da peça deve ter no mínimo 2 caracteres." })
    .max(120, { message: "O nome não pode exceder 120 caracteres." }),
  sku: z
    .string()
    .min(2, { message: "A referência / SKU base é obrigatória." })
    .max(40, { message: "O SKU não pode exceder 40 caracteres." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "O SKU deve conter apenas letras, números, hífens ou underlines.",
    }),
  category_id: z.string().optional().nullable(),
  cost_price: z.coerce
    .number({ invalid_type_error: "Informe um valor numérico para o custo." })
    .min(0, { message: "O preço de custo não pode ser negativo." }),
  sale_price: z.coerce
    .number({ invalid_type_error: "Informe um valor numérico para a venda." })
    .min(0.01, { message: "O preço de venda deve ser maior que zero." }),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
  variants: z
    .array(productVariantSchema)
    .min(1, { message: "Cadastre pelo menos uma variação de grade (tamanho e cor)." }),
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
