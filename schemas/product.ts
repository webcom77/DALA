import { z } from "zod";

/**
 * Calcula o dígito verificador oficial de um código EAN-13 (módulo 10)
 */
export function calculateEan13CheckDigit(first12Digits: string): number {
  const digits = first12Digits.replace(/\D/g, "").slice(0, 12).split("").map(Number);
  while (digits.length < 12) digits.push(0);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Gera um código EAN-13 válido com 13 dígitos numéricos e dígito verificador padrão
 * Prefixo padrão nacional: 789 (Brasil) ou 200 (itens internos da loja)
 */
export function generateEan13(prefix = "789"): string {
  const cleanPrefix = prefix.replace(/\D/g, "").slice(0, 4) || "789";
  const remainingNeeded = 12 - cleanPrefix.length;
  // Gera os dígitos restantes com base em timestamp e random para garantir unicidade
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  const rawMiddle = (timestampPart + randomPart).slice(-remainingNeeded);
  const first12 = (cleanPrefix + rawMiddle).slice(0, 12);
  const checkDigit = calculateEan13CheckDigit(first12);
  return `${first12}${checkDigit}`;
}

/**
 * Validador oficial de formato e dígito verificador EAN-13
 */
export function isValidEan13(code: string): boolean {
  if (!code || !/^\d{13}$/.test(code)) return false;
  const first12 = code.slice(0, 12);
  const checkDigit = Number(code[12]);
  return calculateEan13CheckDigit(first12) === checkDigit;
}

/**
 * Alias compatível com chamadas legadas
 */
export function generateProductReference(prefix = "789"): string {
  return generateEan13(prefix);
}

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, { message: "O tamanho é obrigatório." }),
  color: z.string().min(1, { message: "A cor é obrigatória." }),
  ean13: z
    .string()
    .regex(/^\d{13}$/, { message: "O código EAN-13 deve ter exatamente 13 dígitos numéricos." })
    .optional(),
  sku_variant: z.string().optional(),
  barcode: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome da peça deve ter no mínimo 2 caracteres." })
    .max(120, { message: "O nome não pode exceder 120 caracteres." }),
  ean13: z
    .string()
    .regex(/^\d{13}$/, { message: "O código EAN-13 deve ter exatamente 13 dígitos numéricos." })
    .optional(),
  sku: z.string().optional(),
  image_url: z.string().optional().nullable(),
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

