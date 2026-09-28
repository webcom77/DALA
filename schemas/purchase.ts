import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().min(1, { message: "Selecione o produto." }),
  variant_id: z.string().min(1, { message: "Selecione a variação (tamanho/cor)." }),
  product_name: z.string(),
  sku_variant: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.coerce.number().int().min(1, { message: "Quantidade mínima: 1" }),
  unit_cost: z.coerce.number().min(0.01, { message: "Informe o custo unitário" }),
  total_cost: z.coerce.number().min(0),
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, { message: "Selecione o fornecedor." }),
  expected_delivery: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, { message: "Adicione ao menos um item ao pedido de compra." }),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
