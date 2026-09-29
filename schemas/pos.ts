import { z } from "zod";

export const checkoutSaleSchema = z.object({
  customer_id: z.string().optional().nullable(),
  customer_name: z.string().optional().nullable(),
  payment_method: z.enum(["money", "pix", "credit_card", "debit_card", "promissory"]),
  subtotal: z.coerce.number().min(0.01),
  discount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().min(0.01),
  amount_received: z.coerce.number().optional().nullable(),
  change_amount: z.coerce.number().optional().nullable(),
  installments: z.coerce.number().int().min(1).max(12).default(1),
  down_payment: z.coerce.number().min(0).optional().nullable(),
  down_payment_method: z.enum(["money", "pix", "credit_card", "debit_card"]).optional().nullable(),
  first_due_date: z.string().optional().nullable(),
  items: z.array(
    z.object({
      variant_id: z.string(),
      product_id: z.string(),
      product_name: z.string(),
      sku_variant: z.string(),
      size: z.string(),
      color: z.string(),
      quantity: z.coerce.number().int().min(1),
      unit_price: z.coerce.number().min(0.01),
      discount: z.coerce.number().min(0).default(0),
      total_price: z.coerce.number().min(0.01),
    })
  ).min(1, { message: "O carrinho está vazio." }),
});

export const openCashSessionSchema = z.object({
  initial_balance: z.coerce
    .number({ invalid_type_error: "Informe um valor numérico" })
    .min(0, { message: "O fundo inicial não pode ser negativo." }),
  notes: z.string().optional().or(z.literal("")),
});

export const closeCashSessionSchema = z.object({
  final_balance: z.coerce
    .number({ invalid_type_error: "Informe o valor contado em caixa" })
    .min(0, { message: "O valor final não pode ser negativo." }),
  notes: z.string().optional().or(z.literal("")),
});

export type CheckoutSaleFormData = z.infer<typeof checkoutSaleSchema>;
export type OpenCashSessionFormData = z.infer<typeof openCashSessionSchema>;
export type CloseCashSessionFormData = z.infer<typeof closeCashSessionSchema>;
