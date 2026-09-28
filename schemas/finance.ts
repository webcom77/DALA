import { z } from "zod";

export const financialTransactionSchema = z.object({
  type: z.enum(["payable", "receivable"], {
    errorMap: () => ({ message: "Selecione o tipo de movimentação." }),
  }),
  category: z.string().min(2, { message: "A categoria é obrigatória." }),
  description: z
    .string()
    .min(3, { message: "A descrição deve ter pelo menos 3 caracteres." })
    .max(150, { message: "Máximo de 150 caracteres." }),
  amount: z.coerce
    .number({ invalid_type_error: "Informe um valor válido." })
    .min(0.01, { message: "O valor deve ser maior que zero." }),
  due_date: z.string().min(10, { message: "Informe a data de vencimento." }),
  paid_at: z.string().optional().nullable(),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).default("pending"),
  payment_method: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  customer_id: z.string().optional().nullable(),
  supplier_name: z.string().optional().nullable(),
  customer_name: z.string().optional().nullable(),
  notes: z.string().optional().or(z.literal("")),
});

export type FinancialTransactionFormData = z.infer<typeof financialTransactionSchema>;
