import { z } from "zod";

export const stockMovementSchema = z.object({
  variant_id: z.string().min(1, { message: "Selecione a peça/variação." }),
  type: z.enum(["entry", "exit", "adjustment"], {
    errorMap: () => ({ message: "Tipo de movimentação inválido." }),
  }),
  quantity: z.coerce
    .number({ invalid_type_error: "Informe uma quantidade válida." })
    .int({ message: "A quantidade deve ser um número inteiro." })
    .min(1, { message: "A quantidade deve ser de no mínimo 1 peça." }),
  reason: z
    .string()
    .min(3, { message: "Informe o motivo da movimentação (mínimo 3 caracteres)." })
    .max(200, { message: "Máximo de 200 caracteres." }),
});

export type StockMovementFormData = z.infer<typeof stockMovementSchema>;
